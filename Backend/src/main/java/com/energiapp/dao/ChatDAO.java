package com.energiapp.dao;

import com.energiapp.dto.ChatMessageDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ChatDAO {

    private final DataSource dataSource;

    public ChatDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean guardarMensaje(ChatMessageDTO dto) throws SQLException {
        String sql = "INSERT INTO chat_mensajes (id_usuario, empresa_id, mensaje_usuario, respuesta_bot) " +
                     "VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, dto.getIdUsuario());
            stmt.setInt(2, dto.getEmpresaId());
            stmt.setString(3, dto.getMensajeUsuario());
            stmt.setString(4, dto.getRespuestaBot());

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        dto.setIdMensaje(rs.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    public List<ChatMessageDTO> obtenerHistorial(int idUsuario, int empresaId) throws SQLException {
        List<ChatMessageDTO> historial = new ArrayList<>();
        String sql = "SELECT * FROM chat_mensajes WHERE id_usuario = ? AND empresa_id = ? ORDER BY fecha_envio ASC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idUsuario);
            stmt.setInt(2, empresaId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ChatMessageDTO dto = new ChatMessageDTO();
                    dto.setIdMensaje(rs.getInt("id_mensaje"));
                    dto.setIdUsuario(rs.getInt("id_usuario"));
                    dto.setEmpresaId(rs.getInt("empresa_id"));
                    dto.setMensajeUsuario(rs.getString("mensaje_usuario"));
                    dto.setRespuestaBot(rs.getString("respuesta_bot"));
                    dto.setFechaEnvio(rs.getTimestamp("fecha_envio").toLocalDateTime());
                    historial.add(dto);
                }
            }
        }
        return historial;
    }
}