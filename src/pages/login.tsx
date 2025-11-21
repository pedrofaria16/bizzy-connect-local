import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../css/cadastro.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Use the same body class as cadastro so layouts and background match exactly
    document.body.classList.add('body-cadastro');
    return () => {
      document.body.classList.remove('body-cadastro');
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    try {
  const apiUrl = process.env.NODE_ENV === 'development' ? '/api/auth/login' : 'http://localhost:5000/api/auth/login';
  const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
        if (response.ok) {
        setMensagem('Login realizado com sucesso!');
        // Salva dados do usuário no localStorage
        localStorage.setItem('bizzy_user', JSON.stringify(data.user));
        // Redireciona para o perfil (rota /profile)
        setTimeout(() => navigate('/profile'), 1000);
      } else {
        setMensagem(`Erro: ${data.message}`);
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="container container-cadastro">
      <div className="flex-cadastro">
        <div className="cadastro-img">
          <img src="src/assets/img/bonecos.svg" alt="" width="800px" />
        </div>

        <form className="form-cadastro" onSubmit={handleLogin}>
          <div className="cadastro-header">
            <h1 id="title-cadastro">Bem-vindo de volta!</h1>
            <p className="cadastro-subtitle">Entre com suas credenciais para acessar sua conta</p>
          </div>

          <div className="input-group">
            <label className="input-label">
              <i className='bx bx-envelope'></i>
              E-mail
            </label>
            <input
              placeholder="Digite seu e-mail..."
              type="email"
              className="input-cadastro"
              id="email-login"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <i className='bx bx-lock-alt'></i>
              Senha
            </label>
            <div className="password-input-wrapper">
              <input
                placeholder="Digite sua senha..."
                type={showPassword ? 'text' : 'password'}
                className="input-cadastro"
                id="senha-login"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? 'bx bx-hide' : 'bx bx-show'}></i>
              </button>
            </div>
          </div>

          <div className="flex-confirm">
            <div className="flex-confirm-esquerda">
              <a onClick={() => navigate('/cadastro')} className="link-login" style={{background:'none',border:'none',padding:0,margin:0,display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                <i className='bx bx-user-plus'></i>
                Não tenho conta
              </a>
            </div>

            <div className="flex-confirm-direita">
              <button type="submit" id="continuar-cadastro">
                <i className='bx bx-log-in'></i>
                Entrar
              </button>
            </div>
          </div>

          <div className="cadastro-footer">
            <a href="#" className="forgot-password">
              <i className='bx bx-help-circle'></i>
              Esqueci minha senha
            </a>
          </div>
          {mensagem && (
            <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{mensagem}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
