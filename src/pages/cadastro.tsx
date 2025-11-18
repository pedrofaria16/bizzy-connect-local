import React, { useState, useEffect, ChangeEvent } from "react";
// Função para formatar telefone brasileiro (99) 99999-9999
function formatarTelefone(valor: string) {
  valor = valor.replace(/\D/g, "");
  if (valor.length > 11) valor = valor.slice(0, 11);
  if (valor.length > 6) {
    return `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7)}`;
  } else if (valor.length > 2) {
    return `(${valor.slice(0,2)}) ${valor.slice(2)}`;
  } else if (valor.length > 0) {
    return `(${valor}`;
  }
  return "";
}

// Função para formatar data de nascimento dd/mm/aaaa
function formatarData(valor: string) {
  valor = valor.replace(/\D/g, "");
  if (valor.length > 8) valor = valor.slice(0,8);
  if (valor.length > 4) {
    return `${valor.slice(0,2)}/${valor.slice(2,4)}/${valor.slice(4)}`;
  } else if (valor.length > 2) {
    return `${valor.slice(0,2)}/${valor.slice(2)}`;
  }
  return valor;
}
import { useNavigate } from "react-router-dom";
import "../css/cadastro.css";

const Cadastro: React.FC = () => {
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  // Endereço detalhado
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [cep, setCep] = useState("");
  // Serviços múltiplos
  const servicosOpcoes = [
    "Elétrica", "Pintura", "Jardinagem", "Limpeza", "Aulas", "Transporte", "Tecnologia", "Eventos", "Montagem", "Reformas"
  ];
  const [servicos, setServicos] = useState<string[]>([]);
  const [telefone, setTelefone] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [erros, setErros] = useState<{ telefone?: string; nascimento?: string }>({});
  // Upload de foto
  const [foto, setFoto] = useState<File|null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("body-cadastro");
    return () => {
      document.body.classList.remove("body-cadastro");
    };
  }, []);


  // Manipula upload de foto
  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file); // Salva o arquivo para envio
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manipula seleção múltipla de serviços
  const handleServicoChange = (serv: string) => {
    setServicos((prev) =>
      prev.includes(serv) ? prev.filter((s) => s !== serv) : [...prev, serv]
    );
  };

  // Validação de telefone e nascimento
  function validarTelefone(tel: string) {
    // Aceita formatos (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
    return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(tel);
  }
  function validarNascimento(data: string) {
    // Aceita formato dd/mm/aaaa e data válida
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
    const [d, m, a] = data.split("/").map(Number);
    const dt = new Date(a, m - 1, d);
    return dt.getFullYear() === a && dt.getMonth() === m - 1 && dt.getDate() === d;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    let errosVal: { telefone?: string; nascimento?: string } = {};
    if (!telefone) errosVal.telefone = "Telefone é obrigatório.";
    else if (!validarTelefone(telefone)) errosVal.telefone = "Formato: (99) 99999-9999";
    if (!nascimento) errosVal.nascimento = "Data de nascimento é obrigatória.";
    else if (!validarNascimento(nascimento)) errosVal.nascimento = "Formato: dd/mm/aaaa";
    setErros(errosVal);
    if (Object.keys(errosVal).length > 0) return;
    try {
      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("email", email);
      formData.append("senha", senha);
      formData.append("cpf", cpf);
      formData.append("endereco", `${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}`);
      formData.append("servicos", servicos.join(", "));
      formData.append("telefone", telefone);
      formData.append("nascimento", nascimento);
      if (foto) {
        formData.append("foto", foto);
      }
      const apiUrl = process.env.NODE_ENV === 'development' ? '/api/auth/register' : 'http://localhost:5000/api/auth/register';
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setMensagem("Cadastro realizado com sucesso! Entrando...");
        // Se o backend retornou o usuário, salva no localStorage e navega para o perfil
        try {
          if (data && data.user) {
            localStorage.setItem('bizzy_user', JSON.stringify(data.user));
          }
        } catch (e) { /* ignore storage errors */ }
        setTimeout(() => navigate('/profile'), 1000);
      } else {
        setMensagem(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMensagem("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="container container-cadastro ">
      <div className="flex-cadastro">
        <div className="cadastro-img">
          <img src="src/assets/img/bonecos.svg" alt="" width="800px" />
        </div>
        <form
          className="form-cadastro"
          onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1); }}
        >
          <div className="cadastro-header">
            <h1 id="title-cadastro">Crie sua conta</h1>
            <p className="cadastro-subtitle">
              {step === 1
                ? "Preencha os dados básicos"
                : step === 2
                ? "Agora complete seu endereço e serviços"
                : "Finalize com dados adicionais"}
            </p>
          </div>
          {step === 1 && (
            <>
              <div className="input-group">
                <label className="input-label">Nome</label>
                <input
                  placeholder="Digite seu nome..."
                  type="text"
                  className="input-cadastro"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-envelope"></i>
                  E-mail
                </label>
                <input
                  placeholder="Digite seu e-mail..."
                  type="email"
                  className="input-cadastro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-lock-alt"></i>
                  Senha
                </label>
                <div className="password-input-wrapper">
                  <input
                    placeholder="Digite sua senha..."
                    type={showPassword ? "text" : "password"}
                    className="input-cadastro"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? "bx bx-hide" : "bx bx-show"}></i>
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-id-card"></i>
                  CPF
                </label>
                <input
                  placeholder="Digite seu CPF..."
                  type="text"
                  className="input-cadastro"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-home"></i>
                  Endereço
                </label>
                {/* Top row: CEP (big), Estado (big), Cidade (small) */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>CEP</label>
                    <input placeholder="CEP" type="text" className="input-cadastro" style={{ width: 140 }} value={cep} onChange={e => setCep(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Estado</label>
                    <input placeholder="Estado" type="text" className="input-cadastro" style={{ width: 140 }} value={estado} onChange={e => setEstado(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Cidade</label>
                    <input placeholder="Cidade" type="text" className="input-cadastro" style={{ width: 100 }} value={cidade} onChange={e => setCidade(e.target.value)} />
                  </div>
                </div>

                {/* Bottom row: Rua (big), Nº (small), Bairro (big) */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Rua</label>
                    <input placeholder="Rua" type="text" className="input-cadastro" style={{ width: 220 }} value={rua} onChange={e => setRua(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Nº</label>
                    <input placeholder="Número" type="text" className="input-cadastro" style={{ width: 70 }} value={numero} onChange={e => setNumero(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>Bairro</label>
                    <input placeholder="Bairro" type="text" className="input-cadastro" style={{ width: 160 }} value={bairro} onChange={e => setBairro(e.target.value)} required />
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-briefcase"></i>
                  Serviços que trabalha
                </label>
                <div className="servicos-chips-group">
                  {servicosOpcoes.map((serv) => (
                    <button
                      type="button"
                      key={serv}
                      className={
                        'servico-chip' + (servicos.includes(serv) ? ' servico-chip-selected' : '')
                      }
                      onClick={() => handleServicoChange(serv)}
                    >
                      {serv}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-phone"></i>
                  Telefone <span style={{color:'#e74c3c'}}>*</span>
                </label>
                <input
                  placeholder="(xx) xxxxx-xxxx"
                  type="text"
                  className="input-cadastro"
                  value={telefone}
                  onChange={e => setTelefone(formatarTelefone(e.target.value))}
                  required
                />
                {erros.telefone && <span style={{color:'#e74c3c',fontSize:13}}>{erros.telefone}</span>}
              </div>
              <div className="input-group">
                <label className="input-label">
                  <i className="bx bx-calendar"></i>
                  Data de nascimento <span style={{color:'#e74c3c'}}>*</span>
                </label>
                <input
                  placeholder="dd/mm/aaaa"
                  type="text"
                  className="input-cadastro"
                  value={nascimento}
                  onChange={e => setNascimento(formatarData(e.target.value))}
                  required
                />
                {erros.nascimento && <span style={{color:'#e74c3c',fontSize:13}}>{erros.nascimento}</span>}
              </div>
              <div className="input-group">
                <label className="input-label">Foto de perfil (opcional)</label>
                <div
                  className="foto-upload-group"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={() => document.getElementById('foto-upload')?.click()}
                >
                  <input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFotoChange}
                  />
                  <div style={{ width: 140, height: 140, borderRadius: 8, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#999' }}>
                        <i className="bx bx-camera" style={{ fontSize: 28 }}></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="flex-confirm">
            <div className="flex-confirm-esquerda">
              <button type="button" onClick={() => navigate("/login") } className="link-login" style={{background:'none',border:'none',padding:0,margin:0,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                <i className="bx bx-log-in"></i>
                Já tenho conta
              </button>
            </div>
            <div className="flex-confirm-direita">
              {step === 1 && (
                <button type="button" id="continuar-cadastro" onClick={() => setStep(2)}>
                  <i className="bx bx-right-arrow-alt"></i>
                  Próximo
                </button>
              )}
              {step === 2 && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" id="continuar-cadastro" onClick={() => setStep(1)}>
                    <i className="bx bx-left-arrow-alt"></i>
                    Voltar
                  </button>
                  <button type="button" id="continuar-cadastro" onClick={() => setStep(3)}>
                    <i className="bx bx-right-arrow-alt"></i>
                    Próximo
                  </button>
                </div>
              )}
              {step === 3 && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" id="continuar-cadastro" onClick={() => setStep(2)}>
                    <i className="bx bx-left-arrow-alt"></i>
                    Voltar
                  </button>
                  <button type="submit" id="continuar-cadastro">
                    <i className="bx bx-user-plus"></i>
                    Cadastrar
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="cadastro-footer">
            <p>
              Ao se cadastrar, você concorda com nossos{" "}
              <a href="/termos-de-uso">Termos de Uso</a>.
            </p>
          </div>
          {mensagem && (
            <p style={{ marginTop: "15px", fontWeight: "bold" }}>{mensagem}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
