// const animais = [
//     {
//         id: 1,
//         nome: "Jeninho Santos",
//         especie: "Cachorro",
//         raca: "Labrador",
//         idade: "3 anos",
//         peso: "25kg",
//         tutor: "Cleide Pereira dos Santos",
//         status: "ativo"
//     },
//     {
//         id: 2,
//         nome: "Rex",
//         especie: "Cachorro",
//         raca: "Pastor Alemão",
//         idade: "5 anos",
//         peso: "30kg",
//         tutor: "Jaqueline Silva Pereira",
//         status: "ativo"
//     },
//     {
//         id: 3,
//         nome: "Luna",
//         especie: "Gato",
//         raca: "Siamês",
//         idade: "2 anos",
//         peso: "4kg",
//         tutor: "Jaqueline Silva Pereira",
//         status: "inativo"
//     }
// ];

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    let dias = hoje.getDate() - nascimento.getDate();

    if (dias < 0) {
        meses--;
        const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
        dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
        anos--;
        meses += 12;
    }

    return { anos, meses, dias };
}

function formatarIdade({ anos, meses, dias }) {
    const totalMeses = anos * 12 + meses;

    if (anos >= 1) {
        if (meses > 0) {
            return `${anos} ano${anos > 1 ? 's' : ''} e ${meses} mês${meses > 1 ? 'es' : ''}`;
        }
        return `${anos} ano${anos > 1 ? 's' : ''}`;
    } else if (totalMeses >= 2) {
        return `${totalMeses} mês${totalMeses > 1 ? 'es' : ''}`;
    } else {
        const diasTotais = Math.floor((new Date() - new Date(new Date().getFullYear() - anos, new Date().getMonth() - meses, new Date().getDate() - dias)) / (1000 * 60 * 60 * 24));
        return `${diasTotais} dia${diasTotais > 1 ? 's' : ''}`;
    }
}


function formatarPeso(peso) {
    if (peso === null || peso === undefined || peso === '') {
        return '';
    }
    return parseFloat(peso).toFixed(1);
}

function tratarPesoParaEnvio(peso) {
    if (peso === null || peso === undefined || peso === '') {
        return 0;
    }
    return parseFloat(peso);
}

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    try {
        // Buscar dados do animal com o tutor incluído
        const response = await fetch(`/api/animais/${id}?include=tutor`);
        if (!response.ok) {
            throw new Error('Animal não encontrado');
        }
        const animal = await response.json();

        // Preenche os campos
        document.getElementById('nome').value = animal.nome;
        document.getElementById('especie').value = animal.especie;
        document.getElementById('raca').value = animal.raca;
        
        // Formatar e preencher data de nascimento
        const dataNascimento = new Date(animal.data_nascimento);
        const dataFormatada = dataNascimento.toISOString().split('T')[0];
        document.getElementById('data_nascimento').value = dataFormatada;
        
        // Calcular e exibir idade
        const idade = calcularIdade(dataNascimento);
        document.getElementById('idade').value = formatarIdade(idade);
        
        // Formatar e preencher peso
        document.getElementById('peso').value = formatarPeso(animal.peso);

        // Preencher dados do tutor
        if (animal.tutor) {
            document.getElementById('tutor').value = animal.tutor.nome;
        } else {
            // Se não tiver tutor, buscar o tutor pelo ID
            try {
                const tutorResponse = await fetch(`/api/tutores/${animal.cod_tutor}`);
                if (tutorResponse.ok) {
                    const tutor = await tutorResponse.json();
                    document.getElementById('tutor').value = tutor.nome;
                } else {
                    document.getElementById('tutor').value = 'Tutor não encontrado';
                }
            } catch (error) {
                console.error('Erro ao buscar tutor:', error);
                document.getElementById('tutor').value = 'Erro ao buscar tutor';
            }
        }

        // Configurar o select de status
        const statusSelect = document.getElementById('status');
        statusSelect.value = animal.status ? 'true' : 'false';

        // Configurar o botão de status
        const btnStatus = document.getElementById('btn-status');
        if (animal.status) {
            btnStatus.textContent = 'Desativar';
            btnStatus.style.backgroundColor = '#dc3545';
        } else {
            btnStatus.textContent = 'Ativar';
            btnStatus.style.backgroundColor = '#28a745';
        }

        // Carregar lista de animais vinculados
        const animaisSelect = document.getElementById('animais');
        try {
            const animaisResponse = await fetch('/api/animais');
            const animais = await animaisResponse.json();
            
            animaisSelect.innerHTML = animais
                .filter(a => a.id !== id) // Excluir o animal atual
                .map(a => `<option value="${a.id}">${a.nome}</option>`)
                .join('');
        } catch (error) {
            console.error('Erro ao carregar lista de animais:', error);
        }

        // Adicionar evento de submit ao formulário
        const form = document.getElementById('formAnimal');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const pesoInput = document.getElementById('peso');
            const peso = tratarPesoParaEnvio(pesoInput.value);

            const formData = {
                nome: document.getElementById('nome').value,
                especie: document.getElementById('especie').value,
                raca: document.getElementById('raca').value,
                data_nascimento: document.getElementById('data_nascimento').value,
                peso: peso,
                status: statusSelect.value === 'true',
                cod_tutor: animal.cod_tutor // Manter o mesmo tutor
            };

            try {
                const updateResponse = await fetch(`/api/animais/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (updateResponse.ok) {
                    alert('Animal atualizado com sucesso!');
                    window.location.href = 'buscar.html';
                } else {
                    const error = await updateResponse.json();
                    throw new Error(error.message || 'Erro ao atualizar animal');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao atualizar animal: ' + error.message);
            }
        });

        // Adicionar evento ao botão de status
        btnStatus.addEventListener('click', function () {
            const statusAtual = this.textContent.trim().toLowerCase();
            if (statusAtual === 'desativar') {
                this.textContent = 'Ativar';
                this.style.backgroundColor = '#28a745';
                statusSelect.value = 'false';
            } else {
                this.textContent = 'Desativar';
                this.style.backgroundColor = '#dc3545';
                statusSelect.value = 'true';
            }
        });

        // Adicionar evento ao select de status
        // statusSelect.addEventListener('change', function() {
        //     const isAtivo = this.value === 'true';
        //     btnStatus.textContent = isAtivo ? 'Desativar' : 'Ativar';
        //     btnStatus.style.backgroundColor = isAtivo ? '#dc3545' : '#28a745';
        // });

        // Atualizar idade quando a data de nascimento mudar
        document.getElementById('data_nascimento').addEventListener('change', function() {
            const idade = calcularIdade(new Date(this.value));
            document.getElementById('idade').value = formatarIdade(idade);
        });

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do animal: ' + error.message);
        window.location.href = 'buscar.html';
    }
});