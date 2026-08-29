package sistemapanelessolares.utils;

import at.favre.lib.crypto.bcrypt.BCrypt;
import at.favre.lib.crypto.bcrypt.LongPasswordStrategies;

/**
 * Utilidad para encriptar y verificar contraseñas usando BCrypt
 */
public class EncriptadorContrasena {

    /**
     * Encripta una contraseña en plano usando BCrypt
     * @param contrasenaPlana Contraseña sin encriptar
     * @return Contraseña encriptada
     */
    public static String encriptar(String contrasenaPlana) {
        if (contrasenaPlana == null || contrasenaPlana.isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía");
        }

        return BCrypt.withDefaults()
                .hashToString(12, contrasenaPlana.toCharArray());
    }

    /**
     * Verifica si una contraseña en plano coincide con su versión encriptada
     * @param contrasenaPlana Contraseña sin encriptar
     * @param contrasenaBcrypt Contraseña encriptada con BCrypt
     * @return true si coinciden, false en caso contrario
     */
    public static boolean verificar(String contrasenaPlana, String contrasenaBcrypt) {
        if (contrasenaPlana == null || contrasenaBcrypt == null) {
            return false;
        }

        BCrypt.Result result = BCrypt.verifyer()
                .verify(contrasenaPlana.toCharArray(), contrasenaBcrypt.toCharArray());
        
        return result.verified;
    }
}
