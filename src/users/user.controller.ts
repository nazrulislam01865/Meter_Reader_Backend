import { Controller, Get, Param } from "@nestjs/common";

@Controller('/users')
export class UserController{

    constructor() {}

    @Get()
    getAllUsers() {
        // Logic to retrieve all users
    }

    @Get(':id')
    getUserById(@Param('id') id: string) {
        // Logic to retrieve a user by ID
    }

    @Get('id/dashboard')
    getUserDashboard(@Param('id') id: string) {
        // Logic to retrieve user dashboard data
    }

    @Get('id/profile')
    getUserProfile(@Param('id') id: string) {
        // Logic to retrieve user profile data
    }
    @Get('id/history')
    getUserHistory(@Param('id') id: string) {
        // Logic to retrieve user history data
    }
    



}