import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { STATUS } from "../constants/statusCodes.js";
import { prisma } from "../utils/prismaClient.js";
import { gameModeDataMap } from "../constants/gameModeMap.js";

export const gameModes = asyncHandler(async (req, res) => {
    const name = req.body.name;
    if (!name) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Name is required!"
        );
    }

    const gameModeData = gameModeDataMap[name];
    if (!gameModeData) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Game mode name not found!"
        );
    }

    const data = await prisma.gameMode.findUnique({
        where: { id: gameModeData.id },
        include: { options: true }
    });

    if (data) {
        return res
            .json(
                new ApiResponse(
                    data
                )
            );
    }
    const gameMode = await prisma.gameMode.create({
        data: {
            id: gameModeData.id,
            name: name,
            description: gameModeData.description,
            options: {
                create: gameModeData.options
            }
        },
        include: {
            options: true
        }
    });

    return res
        .status(STATUS.SUCCESS.OK)
        .json(
            new ApiResponse(
                gameMode,
                "Success"
            )
        );
});
