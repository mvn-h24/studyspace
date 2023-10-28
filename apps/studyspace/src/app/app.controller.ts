import { Response } from 'express';
import { Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getData(@Res() response: Response) {
    console.log(response);
  }
}
