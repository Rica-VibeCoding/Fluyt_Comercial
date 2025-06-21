"""
Rate Limiting Simples - Sem dependências extras
Mantém contadores em memória (reseta quando reinicia o servidor)
"""
import time
from typing import Dict, Tuple
from datetime import datetime

class SimpleRateLimit:
    """
    Rate limiter simples baseado em memória
    Perfeito para começar - pode evoluir para Redis depois
    """
    def __init__(self):
        # Dicionário: IP -> (contagem, timestamp_primeira_tentativa)
        self.tentativas: Dict[str, Tuple[int, float]] = {}
        self.janela_segundos = 300  # 5 minutos
        self.max_tentativas = 5
    
    def verificar_limite(self, identificador: str) -> bool:
        """
        Verifica se o identificador (IP ou email) excedeu o limite
        Retorna True se PODE tentar, False se BLOQUEADO
        """
        agora = time.time()
        
        # Limpa entradas antigas (mais de 5 minutos)
        self._limpar_antigas(agora)
        
        if identificador not in self.tentativas:
            # Primeira tentativa
            self.tentativas[identificador] = (1, agora)
            return True
        
        contagem, primeira_tentativa = self.tentativas[identificador]
        
        # Se passou da janela de tempo, reseta
        if agora - primeira_tentativa > self.janela_segundos:
            self.tentativas[identificador] = (1, agora)
            return True
        
        # Ainda dentro da janela
        if contagem >= self.max_tentativas:
            return False  # Bloqueado!
        
        # Incrementa contador
        self.tentativas[identificador] = (contagem + 1, primeira_tentativa)
        return True
    
    def resetar(self, identificador: str):
        """Remove o identificador do limite (usado após login bem-sucedido)"""
        if identificador in self.tentativas:
            del self.tentativas[identificador]
    
    def _limpar_antigas(self, agora: float):
        """Remove entradas antigas para não crescer infinitamente a memória"""
        # Lista de IPs para remover (não pode modificar dict durante iteração)
        para_remover = []
        
        for ip, (_, timestamp) in self.tentativas.items():
            if agora - timestamp > self.janela_segundos:
                para_remover.append(ip)
        
        for ip in para_remover:
            del self.tentativas[ip]
    
    def tempo_restante(self, identificador: str) -> int:
        """Retorna segundos até poder tentar novamente"""
        if identificador not in self.tentativas:
            return 0
            
        _, primeira_tentativa = self.tentativas[identificador]
        tempo_passado = time.time() - primeira_tentativa
        tempo_restante = self.janela_segundos - tempo_passado
        
        return max(0, int(tempo_restante))

# Instância global (singleton)
rate_limiter = SimpleRateLimit()