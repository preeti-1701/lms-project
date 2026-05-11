import { useEffect, useState } from "react";
import styles from "../styles";

function Profile({ token }) {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProfile(data));
  }, [token]);

  return (
    <div>
      <h2>My Profile</h2>

      <div style={styles.card}>
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
      </div>
    </div>
  );
}

export default Profile;