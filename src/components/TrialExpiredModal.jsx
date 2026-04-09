import React from "react";
import "./TrialExpiredModal.css";
import Image from "../assets/expired-img.png"

const TrialExpiredModal = ({ onUpgrade }) => {
    return (
        <div className="trial-overlay">
            <div className="trial-modal">
                <img className="expired-img" src={Image} alt="" />
                <h2>Your 7-Day Free Trial Has Expired</h2>

                <p>
                   Your free plan trial is over. Please upgrade to continue using the service.
                </p>

                <button className="upgrade-btn" onClick={onUpgrade}>
                    Upgrade Plan to Continue
                </button>
            </div>
        </div>
    );
};

export default TrialExpiredModal;