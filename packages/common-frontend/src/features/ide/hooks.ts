import {  useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { AppDispatch, RootState } from "./store";

export const useIDEAppDispatch = () => useDispatch<AppDispatch>();
export const useIDEAppSelector: TypedUseSelectorHook<RootState> = useSelector;
