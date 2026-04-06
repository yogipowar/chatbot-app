import React from "react";
import "./TrialExpiredModal.css";

const TrialExpiredModal = ({ onUpgrade }) => {
    return (
        <div className="trial-overlay">
            <div className="trial-modal">
                <h2>🚫 Trial Expired</h2>

                <p>
                    Your free trial plan is over. Please upgrade to continue using the service.
                </p>

                <button className="upgrade-btn" onClick={onUpgrade}>
                    Upgrade Plan
                </button>
            </div>
        </div>
    );
};

export default TrialExpiredModal;