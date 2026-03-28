import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('survey')
@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new satisfaction survey response' })
  @ApiResponse({ status: 201, description: 'Survey submitted successfully' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createSurveyDto: CreateSurveyDto, @Request() req: any) {
    return this.surveyService.create(createSurveyDto, req.user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all survey responses (Admin only)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAll(@Request() req: any) {
    // Ideally check if req.user is admin here
    return this.surveyService.findAll();
  }
}
