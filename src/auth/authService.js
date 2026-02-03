import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);