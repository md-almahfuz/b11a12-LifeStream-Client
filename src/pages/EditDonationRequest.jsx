import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../provider/AuthProvider";
import axiosInstance from "../api/axiosInstance";
import { useNavigate, useParams, useLoaderData } from "react-router";
import { FaPaperPlane, FaTimesCircle } from "react-icons/fa";
import useRole from "../hooks/useRole";

const EditDonationRequest = () => {
    const { user, getFirebaseIdToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const { role: userRole, loading: isRoleLoading } = useRole();
    const { donationRequest, error: loaderError } = useLoaderData();

    const [formData, setFormData] = useState({});
    const [districts, setDistricts] = useState([]);
    const [allUpazilas, setAllUpazilas] = useState([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(true);

    const [previousStatus, setPreviousStatus] = useState("");
    const [showDonorModal, setShowDonorModal] = useState(false);
    const [selectedDonor, setSelectedDonor] = useState("");

    // Determine permissions
    const isOwner = user?.uid === donationRequest.uid;
    const isAdmin = userRole === "admin";
    const isVolunteer = userRole === "volunteer";

    // Load initial data
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [districtsRes, upazilasRes, usersRes] = await Promise.all([
                    fetch("/districts.json"),
                    fetch("/upazilas.json"),
                    axiosInstance.get("/allusers"),
                ]);

                const districtsJson = await districtsRes.json();
                const upazilasJson = await upazilasRes.json();
                console.log(districtsJson);
                setDistricts(districtsJson[2]?.data || []);
                setAllUpazilas(upazilasJson[2]?.data || []);
                setAllUsers(usersRes.data || []);

                if (loaderError) {
                    toast.error(`Failed to load request: ${loaderError.message}`);
                    navigate("/dashboard");
                    return;
                }

                if (donationRequest) {
                    setFormData({
                        ...donationRequest,
                        donationStatus: donationRequest.donationStatus || "pending",
                    });
                    setPreviousStatus(donationRequest.donationStatus || "pending");

                    const selectedDistrictId = (districtsJson[2]?.data || []).find(
                        (d) => d.name === donationRequest.recipientDistrict
                    )?.id;


                    if (selectedDistrictId) {
                        setFilteredUpazilas(
                            (upazilasJson[2]?.data || []).filter(
                                (u) => u.district_id === selectedDistrictId
                            )
                        );
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load form data");
            } finally {
                setIsLoadingForm(false);
            }
        };
        loadInitialData();
    }, [donationRequest, loaderError, navigate]);


    //console.log("Form Data:", formData);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "donationStatus" && (isAdmin || isVolunteer || isOwner)) {
            // Case 1: pending → inProgress
            if (previousStatus === "pending" && value === "inProgress") {
                setShowDonorModal(true);
            }

            // Case 2: Selecting completed but no donor exists
            if (value === "completed" && !selectedDonor && !formData.donorName) {
                setShowDonorModal(true);
            }
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "recipientDistrict") {
            const selectedDistrictId = districts.find((d) => d.name === value)?.id;
            setFilteredUpazilas(
                selectedDistrictId
                    ? allUpazilas.filter((u) => u.district_id === selectedDistrictId)
                    : []
            );
            setFormData((prev) => ({ ...prev, recipientUpazila: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (
            (isAdmin || isVolunteer || isOwner) &&
            (formData.donationStatus === "inProgress" || formData.donationStatus === "completed") &&
            !selectedDonor &&
            !formData.donorName
        ) {
            toast.error("Please select a donor before proceeding.");
            setIsSubmitting(false);
            return;
        }

        // find donor info
        let donorInfo = {};
        if (selectedDonor) {
            const donorUser = allUsers.find((u) => u._id === selectedDonor);
            if (donorUser) {
                donorInfo = {
                    donorName: donorUser.name,
                    donorEmail: donorUser.email,
                };
            }
        }

        let updatedRequestData = {};
        if (isOwner || isAdmin) {
            updatedRequestData = {
                ...formData,
                ...donorInfo,
                updatedAt: new Date().toISOString(),
            };
        }
        else if (isVolunteer) {
            updatedRequestData = {
                donationStatus: formData.donationStatus, // only this field
                ...(donorInfo.donorName && donorInfo.donorEmail ? donorInfo : {}), // donor info if selected
                updatedAt: new Date().toISOString(),
            };

            // else if (isVolunteer) {
            //     updatedRequestData = {
            //         donationStatus: formData.donationStatus,
            //         ...donorInfo,
            //         updatedAt: new Date().toISOString(),
            //     };
        } else {
            toast.error("You are not allowed to update this request.");
            setIsSubmitting(false);
            return;
        }
        // console.log("Updated Request Data:", updatedRequestData);

        try {
            const idToken = await getFirebaseIdToken();
            await axiosInstance.put(`/editDonationRequest/${id}`, updatedRequestData, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            toast.success("Donation request updated successfully!");
            navigate(isOwner ? "/dashboard/my-donation-requests" : "/dashboard/all-blood-donation-requests");
        } catch (error) {
            console.error(error);
            toast.error("Update failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate(isAdmin || isVolunteer ? "/dashboard/all-blood-donation-requests" : "/dashboard/my-donation-requests");
    };

    const getStatusOptions = () => {
        switch (formData.donationStatus) {
            case "pending":
                return ["pending", "inProgress", "cancel", "completed"];
            case "inProgress":
                return ["inProgress", "cancel", "completed"];
            default:
                return [formData.donationStatus];
        }
    };

    const DonorModal = () => (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Select Donor</h2>
                <select
                    value={selectedDonor}
                    onChange={(e) => setSelectedDonor(e.target.value)}
                    className="select select-bordered w-full mb-4"
                >
                    <option value="">-- Choose a Donor --</option>
                    {allUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                        </option>
                    ))}
                </select>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setSelectedDonor("");
                            setShowDonorModal(false);
                            setFormData((prev) => ({ ...prev, donationStatus: "pending" }));
                        }}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (!selectedDonor) {
                                toast.error("Please select a donor.");
                                return;
                            }
                            setShowDonorModal(false);
                        }}
                        className="btn bg-blue-600 text-white"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );

    if (isLoadingForm || isRoleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <p className="ml-3 text-lg text-gray-700">Loading...</p>
            </div>
        );
    }

    if (!(isAdmin || isVolunteer || isOwner)) {
        return <p className="text-center text-red-500">Access Denied</p>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-red-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
                <h1 className="text-4xl font-extrabold text-blue-800 mb-6 text-center">Edit Donation Request</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status */}
                    <div className="pt-4 border-t border-gray-200">
                        <span className="block text-gray-700 text-sm font-semibold mb-2">
                            Current Donation Status: <span className="text-amber-800 font-semibold">{formData.donationStatus}</span>
                        </span>
                        <select
                            id="donationStatus"
                            name="donationStatus"
                            value={formData.donationStatus}
                            onChange={handleChange}
                            className="select select-bordered w-full px-4 py-2 rounded-lg"
                        >
                            {getStatusOptions().map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Recipient Details */}
                    {[
                        "recipientName",
                        "recipientDistrict",
                        "recipientUpazila",
                        "recipientStreet",
                        "hospitalName",
                        "donationDate",
                        "donationTime",
                        "bloodGroup",
                        "requestMessage",
                    ].map((field) => (
                        <div key={field}>
                            <label className="block text-gray-700">{field.replace(/([A-Z])/g, " $1")}</label>
                            {field === "recipientDistrict" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer}
                                >
                                    <option value="">Select district</option>
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            ) : field === "recipientUpazila" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer || !formData.recipientDistrict}
                                >
                                    <option value="">Select upazila</option>
                                    {filteredUpazilas.map((u) => (
                                        <option key={u.id} value={u.name}>{u.name}</option>
                                    ))}
                                </select>
                            ) : field === "requestMessage" ? (
                                <textarea
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered w-full"
                                    disabled={isVolunteer}
                                />
                            ) : field === "bloodGroup" ? (
                                <select
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="select select-bordered w-full"
                                    disabled={isVolunteer}
                                >
                                    <option value="">Select blood group</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                        <option key={bg} value={bg}>{bg}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.includes("Date") ? "date" : field.includes("Time") ? "time" : "text"}
                                    name={field}
                                    value={formData[field] || ""}
                                    onChange={handleChange}
                                    className="input input-bordered w-full"
                                    disabled={isVolunteer}
                                />
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-ghost text-gray-600 hover:text-red-600 flex items-center"
                        >
                            <FaTimesCircle className="mr-2" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span> Updating...
                                </>
                            ) : (
                                <>
                                    Save Changes <FaPaperPlane className="ml-2" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {showDonorModal && <DonorModal />}
        </div>
    );
};

export default EditDonationRequest;
