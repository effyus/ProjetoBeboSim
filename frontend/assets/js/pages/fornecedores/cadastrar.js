document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const telefoneInput = document.getElementById('telefone');
    const telefoneError = document.getElementById('telefone-error');
    const crmvInput = document.getElementById('crmv');
    const crmvError = document.getElementById('crmv-error');
    
    // Função para aplicar máscara de telefone
    function aplicarMascaraTelefone(value) {
        // Remove tudo que não é dígito
        let telefoneLimpo = value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        telefoneLimpo = telefoneLimpo.substring(0, 11);
        
        // Aplica a máscara conforme digita
        if (telefoneLimpo.length <= 2) {
            return telefoneLimpo;
        } else if (telefoneLimpo.length <= 6) {
            return telefoneLimpo.replace(/(\d{2})(\d{0,4})/, '($1) $2');
        } else if (telefoneLimpo.length <= 10) {
            return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
    }
    
    // Função para validar telefone
    function validarTelefone(telefone) {
        // Remove caracteres não numéricos
        const telefoneLimpo = telefone.replace(/\D/g, '');
        
        // Verifica se tem pelo menos 10 dígitos (DDD + número)
        if (telefoneLimpo.length < 10) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais (números repetitivos)
        if (/^(\d)\1{9,}$/.test(telefoneLimpo)) {
            return false;
        }
        
        // Verifica se o DDD é válido (11 a 99)
        const ddd = parseInt(telefoneLimpo.substring(0, 2));
        if (ddd < 11 || ddd > 99) {
            return false;
        }
        
        return true;
    }
    
    // Aplicar máscara de telefone ao digitar
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value;
        const cursorPosition = e.target.selectionStart;
        
        value = aplicarMascaraTelefone(value);
        e.target.value = value;
        
        // Calcula a nova posição do cursor
        let newCursorPosition = cursorPosition;
        
        // Conta quantos caracteres especiais foram adicionados antes da posição atual
        const originalValue = value.replace(/\D/g, '');
        const originalPosition = Math.min(cursorPosition, originalValue.length);
        
        // Reconstrói a posição considerando a formatação
        let count = 0;
        let digitCount = 0;
        
        for (let i = 0; i < value.length && digitCount < originalPosition; i++) {
            if (/\d/.test(value[i])) {
                digitCount++;
            }
            count++;
        }
        
        newCursorPosition = count;
        
        e.target.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Validar telefone em tempo real se estiver completo
        if (value.length >= 14) {
            if (validarTelefone(value)) {
                telefoneError.style.display = 'none';
                telefoneInput.style.borderColor = '#28a745';
            } else {
                telefoneError.style.display = 'block';
                telefoneInput.style.borderColor = '#dc3545';
            }
        } else {
            telefoneError.style.display = 'none';
            telefoneInput.style.borderColor = '';
        }
    });
    
    // Função para verificar se CRMV já existe
    async function verificarCRMVExistente(crmv) {
        try {
            const response = await fetch(`/api/veterinario?crmv=${crmv}`);
            if (response.ok) {
                const veterinarios = await response.json();
                return veterinarios.some(vet => vet.crmv === crmv);
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar CRMV:', error);
            return false;
        }
    }
    
    // Verificar CRMV em tempo real
    let timeoutCRMV;
    crmvInput.addEventListener('input', function(e) {
        const crmv = e.target.value.trim();
        
        // Limpar timeout anterior
        clearTimeout(timeoutCRMV);
        
        // Esconder erro se campo estiver vazio
        if (!crmv) {
            crmvError.style.display = 'none';
            crmvInput.style.borderColor = '';
            return;
        }
        
        // Aguardar 500ms após parar de digitar para fazer a verificação
        timeoutCRMV = setTimeout(async () => {
            const existe = await verificarCRMVExistente(crmv);
            if (existe) {
                crmvError.style.display = 'block';
                crmvInput.style.borderColor = '#dc3545';
            } else {
                crmvError.style.display = 'none';
                crmvInput.style.borderColor = '#28a745';
            }
        }, 500);
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar telefone antes de enviar
        const telefoneCompleto = document.getElementById('telefone').value;
        if (!telefoneCompleto || telefoneCompleto.length < 14) {
            telefoneError.textContent = 'Telefone incompleto! Por favor, preencha o telefone completo.';
            telefoneError.style.display = 'block';
            telefoneInput.style.borderColor = '#dc3545';
            document.getElementById('telefone').focus();
            return;
        }
        if (!validarTelefone(telefoneCompleto)) {
            telefoneError.textContent = 'Telefone inválido! Por favor, verifique o número.';
            telefoneError.style.display = 'block';
            telefoneInput.style.borderColor = '#dc3545';
            document.getElementById('telefone').focus();
            return;
        }
        
        // Confirmar antes de gravar
        console.log('Mostrando alert de confirmação...');
        const confirmacao = confirm('Deseja realmente cadastrar este veterinário?');
        console.log('Resposta do alert:', confirmacao);
        if (!confirmacao) {
            console.log('Usuário cancelou a operação');
            return;
        }
        console.log('Usuário confirmou, prosseguindo com o cadastro...');
        
        // Coletando os dados do formulário
        const veterinarioData = {
            nome: document.getElementById('nome').value,
            crmv: document.getElementById('crmv').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value.replace(/\D/g, ''), // Remove formatação, mantém apenas números
            status: true // Valor padrão conforme definido no modelo
        };

        try {
            const response = await fetch('/api/veterinario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(veterinarioData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Veterinario cadastrado com sucesso!');
                window.location.href = '/assets/pages/veterinario/buscar.html';
            } else {
                alert('Erro ao cadastrar veterinario: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar veterinario. Por favor, tente novamente.');
        }
    });

}); 