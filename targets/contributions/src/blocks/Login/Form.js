import jsCookie from "js-cookie";
import React from "react";

import Button from "../../elements/Button";
import Field from "../../elements/Field";
import Input from "../../elements/Input";
import { Api } from "../../libs/api";

export default class LoginBlockForm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      emailError: "",
      isLoading: false,
      passwordError: "",
    };
  }

  componentDidMount() {
    this.$email.focus();
  }

  componentDidUpdate() {
    if (this.state.emailError !== null) this.$email.focus();
    if (this.state.passwordError !== null) this.$password.focus();
  }

  async check() {
    const api = new Api("");
    const token = await api.post(
      "/api/login",
      {
        username: this.$email.value,
        password: this.$password.value,
      },
      {
        "Cache-Control": "no-cache",
        Authorization: undefined,
      }
    );

    // Store JSON Web Token in a cookie:
    jsCookie.set("jwt", token.jwt_token, { expires: 30 });
    // jsCookie.set("jwt_refresh_token", token.refresh_token, { expires: 30 });
  }

  async submit(event) {
    const { onLoggedIn } = this.props;

    event.preventDefault();
    if (this.state.isLoading) return;

    this.setState({
      emailError: "",
      isLoading: true,
      passwordError: "",
    });

    if (this.$email.value.length === 0) {
      this.setState({
        emailError: "Vous devez renseigner votre e-mail.",
        isLoading: false,
      });

      return;
    }

    if (this.$password.value.length === 0) {
      this.setState({
        isLoading: false,
        passwordError: "Vous devez renseigner votre mot de passe.",
      });

      return;
    }

    try {
      await this.check();
      onLoggedIn();
    } catch (e) {
      this.setState({
        emailError: "E-mail et/ou mot de passe non reconnu(s).",
        isLoading: false,
      });
    }
  }

  render() {
    const { emailError, isLoading, passwordError } = this.state;

    return (
      <form onSubmit={this.submit.bind(this)}>
        <Field error={emailError} flexDirection="column">
          <Input
            disabled={this.state.isLoading}
            hasError={emailError.length !== 0}
            name="email"
            placeholder="E-mail"
            ref={(node) => (this.$email = node)}
            type="email"
          />
        </Field>
        <Field error={passwordError} flexDirection="column">
          <Input
            disabled={isLoading}
            hasError={passwordError.length !== 0}
            name="password"
            placeholder="Mot de passe"
            ref={(node) => (this.$password = node)}
            type="password"
          />
        </Field>
        <Button disabled={isLoading} onClick={this.submit.bind(this)}>
          Se connecter
        </Button>
      </form>
    );
  }
}
