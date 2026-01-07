Feature: Criar Cliente
  Como um sistema de registro
  Eu quero criar um novo cliente
  Para que o cliente possa ser cadastrado no sistema

  Scenario: Criar cliente com dados válidos
    Given que não existe um cliente com CPF "12312312312"
    When eu criar um cliente com os seguintes dados:
      | cpf           | name          | email            | phone        |
      | 12312312312   | Julia Strain  | julia@gmail.com  | 47999999999  |
    Then o cliente deve ser criado com sucesso
    And o cliente retornado deve ter CPF "12312312312"
    And o cliente retornado deve ter nome "Julia Strain"

  Scenario: Tentar criar cliente que já existe
    Given que já existe um cliente com CPF "12312312312"
    When eu tentar criar um cliente com CPF "12312312312"
    Then deve ser lançado um erro "CUSTOMER_ALREADY_EXISTS"
    And o cliente não deve ser criado

