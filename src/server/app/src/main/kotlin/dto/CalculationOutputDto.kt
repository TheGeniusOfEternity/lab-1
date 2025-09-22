package dto

data class CalculationOutputDto(
    val x: Float,
    val y: Float,
    val r: Int,
    val result: Boolean,
    val currentTime: String,
    val executionTime: String
)
