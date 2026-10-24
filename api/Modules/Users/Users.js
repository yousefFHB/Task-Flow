import { Router } from "express";
import { searchUser, getOne, updateProfile, removeUser } from "./UsersCn.js";
import {
  searchUserValidator,
  getOneValidator,
  updateProfileValidator,
} from "./UsersValidator.js";
import isLogin from "../../MIddlewares/isLogin.js";

const userRouter = Router();

userRouter.get("/", searchUserValidator, searchUser);
userRouter.patch("/", isLogin, updateProfileValidator, updateProfile);
userRouter.delete("/", isLogin, removeUser);
userRouter.get("/:id", getOneValidator, getOne);

export default userRouter;