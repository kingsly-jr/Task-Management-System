public class TestContext {
    public static void main(String[] args) {
        String contextPath = "/";
        String requestUri = "/api/v1/auth/login";
        if (contextPath.length() > 0 && requestUri.startsWith(contextPath)) {
            System.out.println("Stripped: " + requestUri.substring(contextPath.length()));
        }
    }
}
