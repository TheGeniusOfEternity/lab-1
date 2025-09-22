import com.fastcgi.FCGIInterface;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;

public class Server {
    private static final String RESPONSE_TEMPLATE = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: %d\r\n\r\n%s";

    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        while (fcgi.FCGIaccept() >= 0) {
            long startTime = System.currentTimeMillis();
            try {
                String request = getRequest();
                HashMap<String, String> params = parse(request);
                if (!params.containsKey("x") || !params.containsKey("y") || !params.containsKey("r")) {
                    sendResponse("{\"error\": \"missed necessary query param\"}");
                    continue;
                }

                float x = Float.parseFloat(params.get("x"));
                float y = Float.parseFloat(params.get("y"));
                int   r = Integer.parseInt(params.get("r"));

                if (validateX(x) && validateY(y) && validateR(r)) {
                    long endTime = System.currentTimeMillis();
                    DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
                    sendResponse("{\"x\": " + x + ", " +
                            "\"y\": " + y + ", " +
                            "\"r\": " + r + ", " +
                            "\"result\": " + isHit(x, y, r) + ", " +
                            "\"currentTime\": \"" + dtf.format(java.time.LocalDateTime.now()) + "\", " +
                            "\"executionTime\": \"" + (endTime - startTime) + " ms\"}");
                } else {
                    sendResponse("{\"error\": \"invalid data\"}");
                }
            } catch (Exception e) {
                sendResponse(String.format("{\"error\": \"%s\"}", e.getMessage()));
            }
        }
    }

    private static String getRequest() throws IOException {
        try {
            FCGIInterface.request.inStream.fill();
            int contentLength = FCGIInterface.request.inStream.available();
            ByteBuffer buffer = ByteBuffer.allocate(contentLength);
            int readBytes = FCGIInterface.request.inStream.read(buffer.array(), 0, contentLength);
            byte[] requestBodyRaw = new byte[readBytes];
            buffer.get(requestBodyRaw);
            buffer.clear();
            return new String(requestBodyRaw, StandardCharsets.UTF_8);
        } catch (NullPointerException e) {
            return "";
        }
    }

    private static HashMap<String, String> parse(String queryString) {
        HashMap<String, String> map = new HashMap<>();
        if (queryString == null || queryString.isEmpty()) return map;

        if (queryString.startsWith("{") && queryString.endsWith("}")) {
            queryString = queryString.substring(1, queryString.length() - 1);
        }

        String[] pairs = queryString.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2) {
                map.put(
                        URLDecoder.decode(keyValue[0].replaceAll("\"", "").trim(), StandardCharsets.UTF_8),
                        URLDecoder.decode(keyValue[1].replaceAll("\"", "").trim(), StandardCharsets.UTF_8)
                );
            }
        }
        return map;
    }

    private static void sendResponse(String json) {
        try {
            String response = String.format(
                    RESPONSE_TEMPLATE,
                    json.getBytes(StandardCharsets.UTF_8).length,
                    json
            );
            FCGIInterface.request.outStream.write(response.getBytes(StandardCharsets.UTF_8));
            FCGIInterface.request.outStream.flush();
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }
    }

    private static boolean isHit(float x, float y, int R) {
        if (x >= 0 && y >= 0)
            return Math.pow(x, 2) + Math.pow(y, 2) <= Math.pow(R * 0.5, 2);
        if (x < 0 && y > 0)
            return Math.abs(x) + y <= R;
        if (x <= 0 && y <= 0)
            return x >= -R && y >= -R;
        return false;
    }

    public static boolean validateX(float x) {
        return x >= -2 && x <= 2;
    }

    public static boolean validateY(float y) {
        return y > -5 && y < 3;
    }

    public static boolean validateR(int r) {
        return r >= 1 && r <= 5;
    }
}