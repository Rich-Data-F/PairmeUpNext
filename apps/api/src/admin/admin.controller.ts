import { Controller, Get, Post, Param, UseGuards, Request, Body, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('proposed-brands')
  @ApiOperation({ summary: 'Get all proposed brands pending approval' })
  @ApiResponse({ status: 200, description: 'Proposed brands retrieved successfully' })
  async getProposedBrands() {
    return this.adminService.getProposedBrands();
  }

  @Get('proposed-models')
  @ApiOperation({ summary: 'Get all proposed models pending approval' })
  @ApiResponse({ status: 200, description: 'Proposed models retrieved successfully' })
  async getProposedModels() {
    return this.adminService.getProposedModels();
  }

  @Post('proposed-brands/:id/approve')
  @ApiOperation({ summary: 'Approve a proposed brand' })
  @ApiResponse({ status: 200, description: 'Brand approved successfully' })
  async approveBrand(@Param('id') id: string, @Request() req: any) {
    return this.adminService.approveBrand(id, req.user.sub);
  }

  @Post('proposed-brands/:id/reject')
  @ApiOperation({ summary: 'Reject a proposed brand' })
  @ApiResponse({ status: 200, description: 'Brand rejected successfully' })
  async rejectBrand(@Param('id') id: string, @Request() req: any) {
    return this.adminService.rejectBrand(id, req.user.sub);
  }

  @Post('proposed-models/:id/approve')
  @ApiOperation({ summary: 'Approve a proposed model' })
  @ApiResponse({ status: 200, description: 'Model approved successfully' })
  async approveModel(@Param('id') id: string, @Request() req: any) {
    return this.adminService.approveModel(id, req.user.sub);
  }

  @Post('proposed-models/:id/reject')
  @ApiOperation({ summary: 'Reject a proposed model' })
  @ApiResponse({ status: 200, description: 'Model rejected successfully' })
  async rejectModel(@Param('id') id: string, @Request() req: any) {
    return this.adminService.rejectModel(id, req.user.sub);
  }

  @Post('proposed-brands')
  @ApiOperation({ summary: 'Create a new proposed brand' })
  @ApiResponse({ status: 201, description: 'Proposed brand created successfully' })
  async createProposedBrand(@Request() req: any, @Body() body: any) {
    return this.adminService.createProposedBrand({ ...body, submittedBy: req.user.sub });
  }

  @Patch('proposed-brands/:id')
  @ApiOperation({ summary: 'Edit a proposed brand' })
  @ApiResponse({ status: 200, description: 'Proposed brand updated successfully' })
  async editProposedBrand(@Param('id') id: string, @Body() body: any) {
    return this.adminService.editProposedBrand(id, body);
  }

  @Post('proposed-models')
  @ApiOperation({ summary: 'Create a new proposed model' })
  @ApiResponse({ status: 201, description: 'Proposed model created successfully' })
  async createProposedModel(@Request() req: any, @Body() body: any) {
    return this.adminService.createProposedModel({ ...body, submittedBy: req.user.sub });
  }

  @Patch('proposed-models/:id')
  @ApiOperation({ summary: 'Edit a proposed model' })
  @ApiResponse({ status: 200, description: 'Proposed model updated successfully' })
  async editProposedModel(@Param('id') id: string, @Body() body: any) {
    return this.adminService.editProposedModel(id, body);
  }

  @Post('brands')
  @ApiOperation({ summary: 'Create a new canonical brand' })
  @ApiResponse({ status: 201, description: 'Canonical brand created successfully' })
  async createCanonicalBrand(@Request() req: any, @Body() body: any) {
    return this.adminService.createCanonicalBrand(body, req.user.sub);
  }

  @Patch('brands/:id')
  @ApiOperation({ summary: 'Edit a canonical brand' })
  @ApiResponse({ status: 200, description: 'Canonical brand updated successfully' })
  async editCanonicalBrand(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.adminService.editCanonicalBrand(id, body, req.user.sub);
  }

  @Post('models')
  @ApiOperation({ summary: 'Create a new canonical model' })
  @ApiResponse({ status: 201, description: 'Canonical model created successfully' })
  async createCanonicalModel(@Request() req: any, @Body() body: any) {
    return this.adminService.createCanonicalModel(body, req.user.sub);
  }

  @Patch('models/:id')
  @ApiOperation({ summary: 'Edit a canonical model' })
  @ApiResponse({ status: 200, description: 'Canonical model updated successfully' })
  async editCanonicalModel(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.adminService.editCanonicalModel(id, body, req.user.sub);
  }

  @Patch('models/:id/reassign')
  @ApiOperation({ summary: 'Reassign a model to a different brand' })
  @ApiResponse({ status: 200, description: 'Model reassigned successfully' })
  async reassignModel(@Param('id') id: string, @Body() body: { brandId: string }, @Request() req: any) {
    return this.adminService.reassignModel(id, body.brandId, req.user.sub);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users for admin management' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details for admin' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user data (GDPR compliant)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.adminService.updateUser(id, body, req.user.sub);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ summary: 'Reset user password and send reset email' })
  @ApiResponse({ status: 200, description: 'Password reset initiated' })
  async resetUserPassword(@Param('id') id: string, @Request() req: any) {
    return this.adminService.resetUserPassword(id, req.user.sub);
  }

  @Post('users/:id/send-verification')
  @ApiOperation({ summary: 'Send verification email to user' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async sendVerificationEmail(@Param('id') id: string, @Request() req: any) {
    return this.adminService.sendVerificationEmail(id, req.user.sub);
  }
}
