import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Use these throughout the app instead of the plain `useDispatch`/`useSelector`.
// They come pre-typed with our store types so we don't repeat generics everywhere.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
