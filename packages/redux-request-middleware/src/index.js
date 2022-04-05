import createRequestMiddleware from './requestMiddleware'
import createRequestLoggerMiddleware from './requestLogger'
import createResponseParserMiddleware from './responseParser'
import createRequestModifierMiddleware from './requestModifier'

export { createRequestMiddleware, createResponseParserMiddleware, createRequestLoggerMiddleware, createRequestModifierMiddleware }
export const requestMiddleware = createRequestMiddleware()
export const responseParserMiddleware = createResponseParserMiddleware()
export const requestLoggerMiddleware = createRequestLoggerMiddleware()
