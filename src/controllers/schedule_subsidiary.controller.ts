import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

export const createScheduleSubsidiary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ...otherData } = req.body;
    
    const newScheduleSubsidiary = await prisma.scheduleSubsidiary.create({
      data: {
        ...otherData,
      },
    });

    res.status(201).json({ success: true, message: "ScheduleSubsidiary created", data: newScheduleSubsidiary });
  } catch (error) {
    next(error);
  }
};

export const getScheduleSubsidiaryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const scheduleSubsidiary = await prisma.scheduleSubsidiary.findUnique({
      where: { id },
    });

    if (!scheduleSubsidiary) {
      res.status(404).json({ success: false, message: "ScheduleSubsidiary not found" });
      return;
    }

    res.status(200).json({ success: true, data: scheduleSubsidiary });
  } catch (error) {
    next(error);
  }
};

export const updateScheduleSubsidiary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ...otherData } = req.body;

    const updatedScheduleSubsidiary = await prisma.scheduleSubsidiary.update({
      where: { id },
      data: {
        ...otherData,
      },
    });

    res.status(200).json({ success: true, message: "ScheduleSubsidiary updated", data: updatedScheduleSubsidiary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
};

export const getAllScheduleSubsidiaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scheduleSubsidiaries = await prisma.scheduleSubsidiary.findMany();
    res.status(200).json({ success: true, data: scheduleSubsidiaries });
  } catch (error) {
    next(error);
  }
};
