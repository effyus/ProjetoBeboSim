document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('tutorForm');
    const cpfInput = document.getElementById('cpf');
    const cpfError = document.getElementById('cpf-error');
    const cpfDuplicateError = document.getElementById('cpf-duplicate-error');
    const telefoneInput = document.getElementById('telefone');
    const telefoneError = document.getElementById('telefone-error');
    
    // Função para verificar se CPF já existe
    async function verificarCPFExistente(cpf) {
        try {
            const response = await fetch(`/api/tutores?cpf=${cpf}`);
            if (response.ok) {
                const tutores = await response.json();
                return tutores.some(tutor => tutor.cpf === cpf);
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar CPF:', error);
            return false;
        }
    }
    
    // Função para aplicar máscara de CPF
    function aplicarMascaraCPF(value) {
        // Remove tudo que não é dígito
        let cpfLimpo = value.replace(/\D/g, '');
        
        // Limita a 11 dígitos
        cpfLimpo = cpfLimpo.substring(0, 11);
        
        // Aplica a máscara conforme digita
        if (cpfLimpo.length <= 3) {
            return cpfLimpo;
        } else if (cpfLimpo.length <= 6) {
            return cpfLimpo.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        } else if (cpfLimpo.length <= 9) {
            return cpfLimpo.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        } else {
            return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
        }
    }
    
    // Função para validar CPF
    function validarCPF(cpf) {
        cpf = (cpf || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = 11 - (soma % 11);
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;
        return true;
    }
    
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
    
    // Verificar CPF duplicado em tempo real
    let timeoutCPF;
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value;
        const cursorPosition = e.target.selectionStart;
        const oldLength = value.length;
        
        value = aplicarMascaraCPF(value);
        e.target.value = value;
        
        // Ajusta a posição do cursor
        const newLength = value.length;
        if (newLength > oldLength) {
            e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        } else {
            e.target.setSelectionRange(cursorPosition, cursorPosition);
        }
        
        // Limpar timeout anterior
        clearTimeout(timeoutCPF);
        
        // Validar em tempo real se o CPF estiver completo
        if (value.length === 14) {
            if (validarCPF(value)) {
                cpfError.style.display = 'none';
                cpfInput.style.borderColor = '#28a745';
                
                // Verificar se CPF já existe
                timeoutCPF = setTimeout(async () => {
                    const cpfLimpo = value.replace(/\D/g, '');
                    const existe = await verificarCPFExistente(cpfLimpo);
                    if (existe) {
                        cpfDuplicateError.style.display = 'block';
                        cpfInput.style.borderColor = '#dc3545';
                    } else {
                        cpfDuplicateError.style.display = 'none';
                        cpfInput.style.borderColor = '#28a745';
                    }
                }, 500);
            } else {
                cpfError.style.display = 'block';
                cpfDuplicateError.style.display = 'none';
                cpfInput.style.borderColor = '#dc3545';
            }
        } else {
            cpfError.style.display = 'none';
            cpfDuplicateError.style.display = 'none';
            cpfInput.style.borderColor = '';
        }
    });
    
    // Validar CPF ao perder o foco
    cpfInput.addEventListener('blur', async function(e) {
        const cpf = e.target.value;
        if (cpf && cpf.length === 14) {
            if (!validarCPF(cpf)) {
                cpfError.style.display = 'block';
                cpfDuplicateError.style.display = 'none';
                cpfInput.style.borderColor = '#dc3545';
            } else {
                cpfError.style.display = 'none';
                // Verificar se CPF já existe
                const cpfLimpo = cpf.replace(/\D/g, '');
                const existe = await verificarCPFExistente(cpfLimpo);
                if (existe) {
                    cpfDuplicateError.style.display = 'block';
                    cpfInput.style.borderColor = '#dc3545';
                } else {
                    cpfDuplicateError.style.display = 'none';
                    cpfInput.style.borderColor = '#28a745';
                }
            }
        } else {
            cpfError.style.display = 'none';
            cpfDuplicateError.style.display = 'none';
            cpfInput.style.borderColor = '';
        }
    });
    
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
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar CPF antes de enviar
        const cpfCompleto = document.getElementById('cpf').value;
        if (!cpfCompleto || cpfCompleto.length < 14) {
            cpfError.textContent = 'CPF incompleto! Por favor, preencha o CPF completo.';
            cpfError.style.display = 'block';
            cpfInput.style.borderColor = '#dc3545';
            document.getElementById('cpf').focus();
            return;
        }
        if (!validarCPF(cpfCompleto)) {
            cpfError.textContent = 'CPF inválido! Por favor, verifique o número.';
            cpfError.style.display = 'block';
            cpfInput.style.borderColor = '#dc3545';
            document.getElementById('cpf').focus();
            return;
        }
        
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
        const confirmacao = confirm('Deseja realmente cadastrar este tutor?');
        if (!confirmacao) {
            return;
        }
        
        // Coletando os dados do formulário
        const tutorData = {
            nome: document.getElementById('nome').value,
            cpf: cpfCompleto.replace(/\D/g, ''), // Remove formatação, mantém apenas números
            endereco: document.getElementById('endereco').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('telefone').value.replace(/\D/g, ''), // Remove formatação, mantém apenas números
            status: true // Valor padrão conforme definido no modelo
        };

        try {
            const response = await fetch('/api/tutores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tutorData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Tutor cadastrado com sucesso!');
                window.location.href = '/assets/pages/tutores/buscar.html';
            } else {
                alert('Erro ao cadastrar tutor: ' + (data.message || data.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar tutor. Por favor, tente novamente.');
        }
    });

}); 