import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { STATUS } from "../constants/statusCodes.js";
import { prisma } from "../utils/prismaClient.js";
import { generateRandomCode } from "../utils/randomCodeGenerator.js";

const createRoom = asyncHandler(async (req, res) => {
    const { name, type, selectedMode, options } = req.body;
    if (!name) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Room name is required!"
        );
    }

    if (!type) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Room type is required!"
        );
    }

    if (!selectedMode) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Game mode is required!"
        );
    }
    const allOptions = await prisma.gameModeOption.findMany({
        where: {
            key: selectedMode
        }
    });

    const providedOptionsMap = new Map();
    for (const option of options) {
        providedOptionsMap.set(option.name, option.value);
    }

    for (const option of allOptions) {
        if (!option) {
            const providedValue = providedOptionsMap.get(option.key)
            if (!providedValue) {

                if (option.type === "number" && !(Number(providedValue) >= option.min && Number(providedValue) <= option.max)) {
                    throw new ApiError(
                        STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
                        "Please select an option within range!"
                    );
                } else if (option.type === "dropdown" && !option.values.includes(providedValue)) {
                    throw new ApiError(
                        STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
                        "Please enter a valid option!"
                    );
                }
            } else {
                options.push({
                    name: option.key,
                    value: option.defaultValue
                });
            }

        }

    }

    const updatedOptions = options.map(option => ({
        ...option,
        gameModeId: selectedMode
    }));
    const roomCode = generateRandomCode(6);
    const room = await prisma.room.create({
        data: {
            name: name,
            type: type,
            selectedMode: selectedMode,
            options: {
                create: updatedOptions
            },
            users: { connect: [{ id: req.user.id }] },
            createdBy: req.user.id,
            roomCode: roomCode
        },
        include: {
            options: true,
            users: {
                select: { id: true }
            }
        }
    });

    return res
        .status(STATUS.SUCCESS.OK)
        .json(
            room,
            "Room created successfully"
        )

});

const joinRoom = asyncHandler(async (req, res) => {
    const roomCode = req.query.code;
    if (!roomCode) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Room code is required!"
        );
    }
    const getRoom = await prisma.room.findFirst({
        where: {
            roomCode: roomCode
        }
    });

    if (!getRoom) {
        throw new ApiError(
            STATUS.CLIENT_ERROR.NOT_ACCEPTABLE,
            "Please enter a valid roomCode!"
        );
    }

    const room = await prisma.room.update({
        where: { id: getRoom.id },
        data: {
            users: {
                connect: { id: req.user.id }
            }
        },
        include: {
            options: true,
            users: {
                select: { id: true }
            }
        }
    });

    return res
        .status(STATUS.SUCCESS.OK)
        .json(
            new ApiResponse(
                room,
                "Room joined successfully!"
            )
        );
});

export { createRoom, joinRoom }