// ✅ scheduleSubsidiary.controller.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { v4 as uuidv4 } from "uuid";

export const createScheduleSubsidiary = async (
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

    const schedule = await prisma.scheduleSubsidiary.create({ data });
    res
      .status(201)
      .json({ success: true, message: "Schedule created", data: schedule });
  } catch (error) {
    next(error);
  }
};

export const getAllScheduleSubsidiaries = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const schedules = await prisma.scheduleSubsidiary.findMany();
    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

export const getSchedulesBySubsidiaryId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subsidiaryId } = req.params;

    const schedules = await prisma.scheduleSubsidiary.findMany({
      where: { subsidiaryId },
    });

    if (schedules.length === 0) {
      res.status(404).json({
        success: false,
        message: "No schedules found for this subsidiary",
      });
      return;
    }

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

export const updateScheduleSubsidiary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.scheduleSubsidiary.update({
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

export const toggleScheduleSubsidiaryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.scheduleSubsidiary.findUnique({
      where: { id },
    });
    if (!existing) {
      res.status(404).json({ success: false, message: "Schedule not found" });
      return;
    }
    const updated = await prisma.scheduleSubsidiary.update({
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
