import { useEffect } from "react";

function SecurityMonitor() {

    useEffect(() => {

        // 🔒 LOGOUT FUNCTION
        const logoutUser = () => {

            // Clear session
            localStorage.clear();

            // Alert user
            alert(
                "Restricted action detected. Session ended for security reasons."
            );

            // Redirect safely
            window.location.href = "/";
        };

        // 🚫 BLOCK COPY
        const disableCopy = (e) => {

            e.preventDefault();

            logoutUser();
        };

        // 🚫 BLOCK CTRL + C / CTRL + U / F12 / PRINT
        const handleKeyDown = (e) => {

            // CTRL + C
            if (e.ctrlKey && e.key.toLowerCase() === "c") {

                e.preventDefault();

                logoutUser();
            }

            // CTRL + U (view source)
            if (e.ctrlKey && e.key.toLowerCase() === "u") {

                e.preventDefault();

                logoutUser();
            }

            // F12 (developer tools)
            if (e.key === "F12") {

                e.preventDefault();

                logoutUser();
            }

            // PRINT SCREEN
            if (e.key === "PrintScreen") {

                navigator.clipboard.writeText("");

                logoutUser();
            }
        };

        // 🚫 RIGHT CLICK
        const disableRightClick = (e) => {

            e.preventDefault();

            alert("Right click disabled for security.");

        };

        // 🚫 TEXT SELECTION
        const disableSelection = () => {

            return false;
        };

        // ✅ ADD EVENTS
        document.addEventListener(
            "copy",
            disableCopy
        );

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        document.addEventListener(
            "contextmenu",
            disableRightClick
        );

        document.addEventListener(
            "selectstart",
            disableSelection
        );

        // ✅ CLEANUP
        return () => {

            document.removeEventListener(
                "copy",
                disableCopy
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.removeEventListener(
                "contextmenu",
                disableRightClick
            );

            document.removeEventListener(
                "selectstart",
                disableSelection
            );
        };

    }, []);

    return null;
}

export default SecurityMonitor;