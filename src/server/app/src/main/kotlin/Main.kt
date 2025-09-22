import com.fastcgi.FCGIInterface
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import dto.CalculationInputDto
import dto.CalculationOutputDto
import dto.CommonOutputDto
import java.io.IOException
import java.net.URLDecoder
import java.nio.ByteBuffer
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.abs
import kotlin.math.pow

object Server {
    private const val RESPONSE_TEMPLATE: String =
        "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: %d\r\n\r\n%s"

    private val mapper = jacksonObjectMapper()

    fun start() {
        val fcgi = FCGIInterface()
        while (fcgi.FCGIaccept() >= 0) {
            val startTime = System.nanoTime()
            try {
                val request: String = getRequest()
                val calculationInput = parse(request)
                if (calculationInput == null) {
                    sendResponse(mapper.writeValueAsString(CommonOutputDto(
                        status = 400,
                        message = "missed necessary query param"
                    )))
                    continue
                }

                if (validateX(calculationInput.x) && validateY(calculationInput.y) && validateR(calculationInput.r)) {
                    val endTime = System.nanoTime()
                    val dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")
                    sendResponse(mapper.writeValueAsString(CommonOutputDto(
                        status = 200,
                        message = CalculationOutputDto(
                            x = calculationInput.x,
                            y = calculationInput.y,
                            r = calculationInput.r,
                            result = isHit(
                                calculationInput.x,
                                calculationInput.y,
                                calculationInput.r
                            ),
                            currentTime = dtf.format(LocalDateTime.now()),
                            executionTime = "${(endTime - startTime) / 1000000} ms"
                        )
                    )))
                } else {
                    sendResponse(mapper.writeValueAsString(CommonOutputDto(
                        status = 500,
                        message = "invalid data"
                    )))

                }
            } catch (e: Exception) {
                sendResponse(mapper.writeValueAsString(CommonOutputDto(
                    status = 500,
                    message = e.message
                )))
            }
        }
    }

    @Throws(IOException::class)
    private fun getRequest(): String {
        try {
            FCGIInterface.request.inStream.fill()
            val contentLength = FCGIInterface.request.inStream.available()
            val buffer = ByteBuffer.allocate(contentLength)
            val readBytes = FCGIInterface.request.inStream.read(buffer.array(), 0, contentLength)
            val requestBodyRaw = ByteArray(readBytes)
            buffer[requestBodyRaw]
            buffer.clear()
            return String(requestBodyRaw, StandardCharsets.UTF_8)
        } catch (e: NullPointerException) {
            return ""
        }
    }

    private fun parse(queryString: String): CalculationInputDto? {
        return try {
            mapper.readValue<CalculationInputDto>(queryString)
        } catch (_: Exception) {
            return null
        }
    }

    private fun sendResponse(json: String) {
        try {
            val response = String.format(
                RESPONSE_TEMPLATE,
                json.toByteArray(StandardCharsets.UTF_8).size,
                json
            )
            FCGIInterface.request.outStream.write(response.toByteArray(StandardCharsets.UTF_8))
            FCGIInterface.request.outStream.flush()
        } catch (e: IOException) {
            println(e.message)
        }
    }

    private fun isHit(x: Float, y: Float, r: Int): Boolean {
        if (x >= 0 && y >= 0) return x.pow(2) + y.pow(2) <= (r * 0.5).pow(2.0)
        if (x < 0 && y > 0) return abs(x.toDouble()) + y <= r
        if (x <= 0 && y <= 0) return x >= -r && y >= -r
        return false
    }

    private fun validateX(x: Float): Boolean {
        return x >= -2 && x <= 2
    }

    private fun validateY(y: Float): Boolean {
        return y > -5 && y < 3
    }

    private fun validateR(r: Int): Boolean {
        return r in 1..5
    }
}

fun main(args: Array<String>) {
    Server.start()
}