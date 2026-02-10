export const paginate = (data, currentPage, limitItems) => {
    let pagination = {
        currentPage: 1,
        limitItems: limitItems,
    }

    pagination.quantityItem = data.length;
    pagination.totalPage = Math.ceil(pagination.quantityItem / pagination.limitItems);
    
    const startIndex = (currentPage - 1) * pagination.limitItems;
    const endIndex = startIndex + pagination.limitItems;
    pagination.currentItems = data.slice(startIndex, endIndex);

    return pagination;
}