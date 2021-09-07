import { Request, Response } from 'express';
import { createResponse, JsonResponse } from '../utilities/response';
import { getSysInfo, SysInfo } from '../utilities/sysinfo';

export function getHome(req: Request, res: Response): Response<JsonResponse<SysInfo>> {
  try {
    const sysInfo = getSysInfo();
    return createResponse(res, 200, { data: sysInfo });
  } catch (error) {
    return createResponse(res, 500, { error: { message: 'Failed to fetch sys info' } });
  }
}
