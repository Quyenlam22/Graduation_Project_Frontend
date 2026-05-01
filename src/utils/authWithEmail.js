import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { auth } from "../firebase/config";
import { changeStatus, register } from "../services/authService";

export const authWithEmail = async (email, password, mode = "login", displayName) => {
  try {
    let userCredential;

    if (mode === "register") {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName });
      await user.reload();
      const updatedUser = auth.currentUser;

      await register({
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: displayName || updatedUser.displayName,
        photoURL: updatedUser.photoURL,
        provider: "email",
        role: "user",
      });

      localStorage.setItem("isRegister", "true");
    } else {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await changeStatus({ uid: user.uid, state: "online" });

      localStorage.setItem("isLogin", "true");
    }

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};