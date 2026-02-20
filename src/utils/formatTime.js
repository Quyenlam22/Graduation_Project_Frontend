import moment from 'moment';
import 'moment/locale/vi'; 

moment.locale('vi');

/**
 * Hàm định dạng ngày tháng cơ bản
 * @param {Date|string} date - Giá trị thời gian đầu vào
 * @param {string} formatStr - Định dạng mong muốn (mặc định: DD/MM/YYYY)
 */
export const formatDate = (date, formatStr = 'DD/MM/YYYY') => {
    if (!date) return '---';
    return moment(date).format(formatStr);
};

/**
 * Hàm tính thời gian trôi qua (ví dụ: "5 phút trước", "2 ngày trước")
 * @param {Date|string} date 
 */
export const fromNow = (date) => {
    if (!date) return '';
    // .clone() là cực kỳ quan trọng trong Moment để tránh làm thay đổi dữ liệu gốc
    return moment(date).clone().fromNow();
};

/**
 * Hàm lấy thời gian hiện tại hoặc cộng thêm thời gian
 * Trả về object Moment để bạn tùy ý xử lý tiếp
 */
export const getRelativeTime = (amount, unit) => {
    return moment().add(amount, unit).format('LLLL');
};

export default moment;