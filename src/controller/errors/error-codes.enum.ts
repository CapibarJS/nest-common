export enum ErrorCodes {
    OK = 10001, // Успешно
    CREATED = 10002, // Создано
    ACCEPTED = 10003, // Принято
    NO_CONTENT = 10004, // Нет содержимого
    MOVED_PERMANENTLY = 10005, // Редирект. Перемещено навсегда
    FOUND = 10006, // Редирект. Найдено
    NOT_MODIFIED = 10007, // Редирект. Не изменено
    BAD_REQUEST = 10008, // Неверный запрос. Ошибка в построении запроса
    UNAUTHORIZED = 10009, // Неавторизован
    FORBIDDEN = 10010, // Запрещено
    NOT_FOUND = 10011, // 404 Не найдено
    METHOD_NOT_ALLOWED = 10012, // Метод не разрешен
    NOT_ACCEPTABLE = 10013, // Неприемлемо
    REQUEST_TIMEOUT = 10014, // Время запроса истекло
    CONFLICT = 10015, // Конфликт
    GONE = 10016, // Удалено
    PAYLOAD_TOO_LARGE = 10017, // Слишком большое тело запроса
    UNSUPPORTED_MEDIA_TYPE = 10018, // Неподдерживаемый тип медиа
    UNPROCESSABLE_ENTITY = 10019, // Необрабатываемая сущность
    INTERNAL_SERVER_ERROR = 10020, // Внутренняя ошибка сервера
    NOT_IMPLEMENTED = 10021, // Не реализовано
    SERVICE_UNAVAILABLE = 10023, // Сервис недоступен
}
