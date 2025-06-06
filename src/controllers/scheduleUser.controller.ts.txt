// ✅ scheduleUser.controller.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { v4 as uuidv4 } from "uuid";

export const createScheduleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = {
      ...req.body,
      id: uuidv4(),
      opening_hour: req.body.opening_hour
        ? new Date(req.body.opening_hour)
        : null,
      closing_hour: req.body.closing_hour
        ? new Date(req.body.closing_hour)
        : null,
    };

    const schedule = await prisma.scheduleUser.create({ data });
    res
      .status(201)
      .json({ success: true, message: "Schedule created", data: schedule });
  } catch (error) {
    next(error);
  }
};

export const getAllSchedules = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schedules = await prisma.scheduleUser.findMany();
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

export const getSchedulesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const schedules = await prisma.scheduleUser.findMany({ where: { userId } });
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

export const updateScheduleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.scheduleUser.update({
      where: { id },
      data: {
        ...req.body,
        opening_hour: req.body.opening_hour
          ? new Date(req.body.opening_hour)
          : null,
        closing_hour: req.body.closing_hour
          ? new Date(req.body.closing_hour)
          : null,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "Schedule updated", data: updated });
  } catch (error) {
    next(error);
  }
};

export const toggleScheduleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.scheduleUser.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Schedule not found" });
      return;
    }
    const updated = await prisma.scheduleUser.update({
      where: { id },
      data: { status: !existing.status },
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Schedule status toggled",
        data: updated,
      });
  } catch (error) {
    next(error);
  }
};
