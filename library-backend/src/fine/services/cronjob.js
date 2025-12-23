import cron from 'node-cron';
import autoGenerateFine from './autoGenerateFine.js';

const scheduleFineGenerationJob = () => {
    // chạy mỗi giờ 
    cron.schedule("0 * * * *", async () => {
        console.log('Cron job: tự động tạo phạt trễ hạn mượn sách');
        await autoGenerateFine();
    });

    console.log('Phạt trễ hạn mượn sách cron job đã được lên lịch.');
};

export default scheduleFineGenerationJob;  