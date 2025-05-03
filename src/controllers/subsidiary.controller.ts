import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';


export const createSubsidiary = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { ...otherData } = req.body;

    const newSubsidiary = await prisma.subsidiary.create({
      data: {
        id: uuidv4(),
        ...otherData,
      },
    });

    res.status(201).json({ success: true, message: "Subsidiary created", data: newSubsidiary });
  } catch (error) {
    next(error);
  }
};

export const getSubsidiaryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const subsidiary = await prisma.subsidiary.findUnique({
      where: { id },
    });

    if (!subsidiary) {
      res.status(404).json({ success: false, message: "Subsidiary not found" });
      return;
    }

    res.status(200).json({ success: true, data: subsidiary });
  } catch (error) {
    next(error);
  }
};

export const updateSubsidiary = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ...otherData } = req.body;

    const updatedSubsidiary = await prisma.subsidiary.update({
      where: { id },
      data: {
        ...otherData,
      },
    });

    res.status(200).json({ success: true, message: "Subsidiary updated", data: updatedSubsidiary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error });
  }
};

export const getAllSubsidiaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subsidiaries = await prisma.subsidiary.findMany();

    res.status(200).json({ success: true, data: subsidiaries });
  } catch (error) {
    next(error);
  }
}
