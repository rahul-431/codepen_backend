class ApiResponse {
  data?: {};
  message: string = "";
  constructor(data: {}, message = "success") {
    this.data = data;
    message = message;
  }
}
export { ApiResponse };
