import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { STATUS } from "../constants/statusCodes.js";
import { prisma } from "../utils/prismaClient.js";

export const gameModes = asyncHandler(async (req, res) => {

    const gameMode = await prisma.gameMode.findMany({
        include: {
            options: true
        }
    })

    return res
        .status(STATUS.SUCCESS.OK)
        .json(
            new ApiResponse(
                gameMode,
                "Success"
            )
        );
});
