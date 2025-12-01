import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../css/politica-de-privacidade.css';

const TermosDeUso: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div>
            <div className="titulo">
                <a className="back-link" onClick={() => navigate("/feed")}>{t('Voltar')}</a>
                <h1>{t('Termos de Uso')}</h1>
                <div className="nada"></div>
            </div>

            <div className="textoPolitica">
                <div className="topico">
                    <h2>{t('1. Aceitação dos Termos')}</h2>
                </div>

                <div className="paragrafo">
                    <p>
                        {t('Ao acessar e utilizar o site da Bizzy, você concorda em cumprir integralmente estes')} <b>{t('Termos de Serviço')}</b>, {t('bem como todas as leis e regulamentações aplicáveis. Caso não concorde com qualquer disposição aqui apresentada, você')} <b>{t('não está autorizado a utilizar ou acessar este site')}</b>. {t('Todos os materiais disponibilizados na plataforma da Bizzy estão protegidos por')} <b>{t('leis de direitos autorais, propriedade intelectual e marcas registradas')}</b>.
                    </p>
                </div>

                <div className="topico">
                    <h2>{t('2. Licença de Uso Limitado')}</h2>
                </div>

                <div className="paragrafo">
                    <p>
                        {t('A Bizzy concede a você uma')} <b>{t('licença temporária, não exclusiva e intransferível')}</b> {t('para acessar e baixar materiais (informações, softwares ou outros conteúdos) disponíveis no site,')} <b>{t('exclusivamente para uso pessoal e não comercial')}</b>. {t('Esta licença')} <b>{t('não constitui uma transferência de titularidade')}</b>, {t('e, sob nenhuma circunstância, você poderá:')}
                    </p>
                    <ul>
                        <li><b>{t('Modificar, copiar ou reproduzir')}</b> {t('os materiais sem autorização expressa;')}</li>
                        <li><b>{t('Utilizar os conteúdos para fins comerciais')}</b>, {t('incluindo exibição pública (seja com ou sem fins lucrativos);')}</li>
                        <li><b>{t('Realizar engenharia reversa, descompilar ou desmontar')}</b> {t('qualquer software disponibilizado pela Bizzy;')}</li>
                        <li><b>{t('Remover avisos de direitos autorais, marcas registradas ou outras menções de propriedade intelectual')}</b>;</li>
                        <li><b>{t('Distribuir, espelhar ou hospedar')}</b> {t('os materiais em outros servidores ou sistemas.')}</li>
                    </ul>
                    <p>
                        {t('Esta licença')} <b>{t('encerra-se automaticamente')}</b> {t('em caso de violação de qualquer uma dessas condições. Ao término da licença ou se for revogada pela Bizzy, você')} <b>{t('deve excluir imediatamente')}</b> {t('todos os materiais baixados, sejam eles digitais ou impressos.')}
                    </p>
                </div>

                <div className="topico">
                    <h2>{t('3. Isenção de Responsabilidade')}</h2>
                </div>

                <div className="paragrafo">
                    <p>{t('Os materiais disponíveis no site da Bizzy são fornecidos')} <b>{t('"no estado em que se encontram"')}</b>, {t('sem garantias de qualquer natureza, sejam')} <b>{t('expressas ou implícitas')}</b>. {t('A Bizzy')} <b>{t('não se responsabiliza por')}</b>:</p>
                    <ul>
                        <li><b>{t('Garantias de comercialização;')}</b></li>
                        <li><b>{t('Adequação a um propósito específico;')}</b></li>
                        <li><b>{t('Não violação de direitos de propriedade intelectual;')}</b></li>
                        <li><b>{t('Precisão, confiabilidade ou atualidade dos materiais.')}</b></li>
                    </ul>
                    <p>{t('Além disso, a Bizzy')} <b>{t('não garante')}</b> {t('que o uso dos materiais disponíveis no site ou em plataformas vinculadas produzirá resultados específicos.')}</p>
                </div>

                <div className="topico">
                    <h2>{t('4. Limitação de Responsabilidade')}</h2>
                </div>

                <div className="paragrafo">
                    <p>{t('Em')} <b>{t('nenhuma hipótese')}</b> {t('a Bizzy ou seus fornecedores serão responsabilizados por quaisquer danos decorrentes do uso ou da impossibilidade de uso dos materiais disponíveis no site, incluindo, mas não se limitando a:')}</p>
                    <ul>
                        <li><b>{t('Perda de dados ou lucros;')}</b></li>
                        <li><b>{t('Interrupção de negócios;')}</b></li>
                        <li><b>{t('Danos indiretos, incidentais ou consequenciais.')}</b></li>
                    </ul>
                </div>

                <div className="topico">
                    <h2>{t('5. Precisão dos Materiais')}</h2>
                </div>

                <div className="paragrafo">
                    <p>
                        {t('Os conteúdos disponíveis no site da Bizzy')} <b>{t('podem conter erros técnicos, tipográficos ou fotográficos')}</b>. {t('A Bizzy')} <b>{t('não garante')}</b> {t('que os materiais sejam')} <b>{t('precisos, completos ou atualizados')}</b> {t('e reserva-se o direito de')} <b>{t('modificar, corrigir ou remover')}</b> {t('informações a qualquer momento,')} <b>{t('sem aviso prévio')}</b>. {t('A Bizzy')} <b>{t('não assume o compromisso')}</b> {t('de atualizar os materiais regularmente.')}
                    </p>
                </div>

                <div className="topico">
                    <h2>{t('6. Links Externos')}</h2>
                </div>

                <div className="paragrafo">
                    <p>
                        {t('A Bizzy')} <b>{t('não analisou todos os sites vinculados ao seu domínio e não se responsabiliza')}</b> {t('pelo conteúdo de páginas de terceiros. A inclusão de qualquer link')} <b>{t('não implica endosso')}</b> {t('pela Bizzy. O acesso e uso de sites externos são')} <b>{t('de inteira responsabilidade do usuário.')}</b>
                    </p>
                </div>

                <div className="topico">
                    <h2>{t('7. Modificações nos Termos de Serviço')}</h2>
                </div>

                <div className="paragrafo">
                    <p>
                        {t('A Bizzy')} <b>{t('pode revisar e atualizar')}</b> {t('estes Termos de Serviço')} <b>{t('a qualquer momento')}</b>, {t('sem notificação prévia. Ao continuar utilizando o site após eventuais alterações, você')} <b>{t('concorda automaticamente')}</b> {t('com a versão mais recente dos termos.')}
                    </p>
                </div>

                <div className="topico">
                    <h2>{t('8. Lei Aplicável e Jurisdição')}</h2>
                </div>

                <div className="paragrafo">
                    <p>
                        <b>{t('Estes Termos de Serviço são regidos e interpretados')}</b> {t('conforme as leis vigentes na jurisdição da Bizzy. Qualquer disputa relacionada a estes termos')} <b>{t('deverá ser resolvida')}</b> {t('nos tribunais competentes da localidade em que a Bizzy está estabelecida, com')} <b>{t('jurisdição exclusiva')}</b>.
                    </p>
                    <p>{t('Data de vigência: 29 de maio de 2025.')}</p>
                    <p>
                        {t('Ao utilizar os serviços da Bizzy, você reconhece e aceita integralmente estes Termos de Serviço. Em caso de dúvidas, entre em contato conosco através dos nossos canais oficiais.')}
                    </p>
                    <p><b>{t('E-mail:')}</b> bizzy@gmail.com</p>
                    <p><b>{t('Agradecemos por escolher a Bizzy!')}</b></p>
                </div>
            </div>

            <div className="sobrenos-footer">
                <div className="sobrenos-footer-container">
                    <div className="sobrenos-footer-col">
                        <h1>{t('Empresa')}</h1>
                        <a href="sobre-nos" className="sobrenos-atend">{t('Sobre nós')}</a>
                        <a href="/feed"><img src="src/assets/img/logo-branca.svg" alt="Logo" /></a>
                    </div>
                    <div className="sobrenos-footer-col">
                        <h1>{t('Contato')}</h1>
                        <p className="bizzy-email">bizzyorg@gmail.com</p>
                        <p className="sobrenos-telefone-footer">+55 67 98466-9533</p>
                    </div>
                    <div className="sobrenos-footer-col">
                        <h1>{t('Ajuda')}</h1>
                        <a href="#" className="sobrenos-atend">{t('Atendimento ao cliente')}</a>
                        <a href="#" className="sobrenos-atend">{t('Perguntas frequentes')}</a>
                    </div>
                    <div className="sobrenos-footer-col">
                        <h1>{t('Siga-nos')}</h1>
                        <div className="sobrenos-social-icons">
                            <a href="#"><img src="src/assets/img/21.png" alt="Facebook" /></a>
                            <a href="#"><img src="src/assets/img/22.png" alt="X" /></a>
                            <a href="#"><img src="src/assets/img/19.png" alt="Instagram" /></a>
                        </div>
                        <p className="sobrenos-copyright">{t('Todos Direitos Reservados ©')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermosDeUso;