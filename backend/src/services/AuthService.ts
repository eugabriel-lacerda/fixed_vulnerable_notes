import { AppError } from "../errors/AppError";
import { createUser, findUserByEmail, getPasswordHashByEmail } from "../repositories/AuthRepository";
import { generateToken } from "../utils/generateToken";
import { hashPassword, comparePassword } from "../utils/hashPassword";

export async function registerUser(email: string, password: string) {
    const userAlreadyExists = await findUserByEmail(email);

    if (userAlreadyExists){
        throw new AppError("User already exists", 409);
    }

    const hashedPassword = await hashPassword(password)

    const user = await createUser(email, hashedPassword);

    const token = generateToken(user.id)

    return {user, token};

}


export async function loginUser(email: string, password: string){
    const user = await findUserByEmail(email);
    const userPasswordHashed = await getPasswordHashByEmail(email)

    if(!user || !userPasswordHashed || !(await comparePassword(password, userPasswordHashed))){
        throw new AppError("Invalid credentials", 404);
    }

    const token = generateToken(user.id)

    return {user, token}


}