import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { STATUS } from "../constants/statusCodes.js";
import { prisma } from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import { cookieOptions } from "../constants/cookieOptions.js";
import { generateAccessToken } from "../utils/tokenGenerator.js";

const guestLogin = asyncHandler(async (req, res) => {
    const user = await prisma.user.create({
        data: {
            isGuest: true
        }
    });

    const accessToken = generateAccessToken(user);

    return res
        .status(STATUS.SUCCESS.OK)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                { user, accessToken },
                "Guest user created successfully"
            )
        );
});

const login = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const guestId = req.user.id;
    if (!name) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Name is required!"
        );
    }
    if (!email) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Email is required!"
        );
    }

    const isMatchEmail = String(email).toLowerCase().match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (!isMatchEmail) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Invalid email address."
        );
    }

    if (!password) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Password is required!"
        );
    }


    const userExists = await prisma.user.findUnique({ where: { email: email } });

    if (!userExists) {
        await prisma.user.update({
            where: {
                id: guestId
            },
            data: {
                email: email,
                password: await bcrypt.hash(password, 10),
                name: name,
                isGuest: false
            }
        });
    } else {
        const isPasswordValid = await bcrypt.compare(password, userExists.password);

        if (!isPasswordValid) {
            throw new ApiError(
                STATUS.CLIENT_ERROR.UNAUTHORIZED,
                "Incorrect password! Try again later"
            );
        }

        await prisma.user.delete({
            where: { id: guestId }
        });
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    const accessToken = generateAccessToken(user);

    const { password: _unused, ...sanitizedUser } = user;

    return res
        .status(STATUS.SUCCESS.OK)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                { user: sanitizedUser, accessToken },
                "User logged in successfully."
            )
        )
});

export { guestLogin, login }