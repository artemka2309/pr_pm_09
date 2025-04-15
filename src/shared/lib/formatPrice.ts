/**
 * Форматирует число в строку цены с разделителями тысяч и знаком рубля.
 * @param price - Число для форматирования.
 * @param currencySymbol - Символ валюты (по умолчанию '₽').
 * @returns Отформатированная строка цены или пустая строка, если входные данные некорректны.
 */
export const formatPrice = (price: number | null | undefined, currencySymbol: string = '₽'): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return ''; // Возвращаем пустую строку для невалидных входных данных
  }

  // Используем Intl.NumberFormat для корректного форматирования
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'decimal', // Просто форматирование числа
    minimumFractionDigits: 0, // Без копеек
    maximumFractionDigits: 0
  });

  // Форматируем число и добавляем символ валюты
  return `${formatter.format(price)} ${currencySymbol}`.trim();
}; 