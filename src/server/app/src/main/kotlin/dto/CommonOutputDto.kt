package dto

data class CommonOutputDto<T>(
    val status: Int,
    val message: T
)