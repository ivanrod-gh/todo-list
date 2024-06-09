import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { JWTAuthGuard } from 'src/auth/jwt-auth.guard';
import { OwnerGuard } from './owner.guard';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('Проекты')
@Controller('api/:userId/projects')
export class ProjectsController {
  
  constructor(private readonly projectService: ProjectsService) {}

  @ApiOperation({summary: 'Создать проект пользователя'})
  @ApiResponse({status: 200, type: Project})
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateProjectDto
  ) {
    console.log('CONTROLLER CREATE')
    return this.projectService.create(userId, dto);
  }

  @ApiOperation({summary: 'Получить все проекты пользователя'})
  @ApiResponse({status: 200, type: [Project]})
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.projectService.getAll(userId);
  }

  @ApiOperation({summary: 'Получить проект пользователя'})
  @ApiResponse({status: 200, type: Project})
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Get(':projectId')
  getOne(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.getOne(projectId);
  }

  @ApiOperation({summary: 'Удалить проект пользователя'})
  @ApiResponse({status: 200, type: Project})
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Delete(':projectId')
  delete(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.delete(projectId);
  }

  @ApiOperation({summary: 'Удалить определенный проект пользователя'})
  @ApiResponse({status: 200, type: Project})
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':projectId')
  update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto
  ) {
    return this.projectService.update(projectId, dto);
  }
}
