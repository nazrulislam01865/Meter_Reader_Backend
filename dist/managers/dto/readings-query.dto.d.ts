export declare class ReadingsQueryDto {
    search?: string;
    status?: 'All' | 'Submitted' | 'Pending' | 'Rejected';
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
}
