'use client';

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ContratoData } from "../../../types/contrato";

interface ContractPDFGeneratorProps {
  contratoData: ContratoData;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #333',
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  column: {
    flex: 1,
    marginRight: 15,
  },
  partyBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 10,
    border: '1 solid #e9ecef',
  },
  partyTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ambienteItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginBottom: 8,
    border: '1 solid #e9ecef',
  },
  ambienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  ambienteTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  ambienteValue: {
    fontWeight: 'bold',
    color: '#16a34a',
  },
  totalBox: {
    backgroundColor: '#dbeafe',
    padding: 12,
    marginTop: 10,
    border: '1 solid #3b82f6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1d4ed8',
  },
  terms: {
    marginBottom: 15,
  },
  termTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  signatureSection: {
    marginTop: 30,
    borderTop: '1 solid #e9ecef',
    paddingTop: 20,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1 solid #333',
    paddingTop: 5,
    marginTop: 30,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 10,
    color: '#666',
  },
});

export const ContractPDFGenerator = ({ contratoData }: ContractPDFGeneratorProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
          <Text style={styles.subtitle}>{contratoData.loja.nome}</Text>
          <Text>Contrato nº {contratoData.numero} - {formatDate(contratoData.data_criacao)}</Text>
        </View>

        {/* Partes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTES CONTRATANTES</Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <View style={styles.partyBox}>
                <Text style={styles.partyTitle}>CONTRATADA:</Text>
                <Text>{contratoData.loja.nome}</Text>
                <Text>CNPJ: {contratoData.loja.cnpj}</Text>
                <Text>{contratoData.loja.endereco}</Text>
                <Text>Tel: {contratoData.loja.telefone}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.partyBox}>
                <Text style={styles.partyTitle}>CONTRATANTE:</Text>
                <Text>{contratoData.cliente.nome}</Text>
                <Text>CPF: {contratoData.cliente.cpf}</Text>
                <Text>{contratoData.cliente.endereco}</Text>
                <Text>Tel: {contratoData.cliente.telefone}</Text>
                <Text>E-mail: {contratoData.cliente.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Objeto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OBJETO DO CONTRATO</Text>
          <Text style={{ marginBottom: 10 }}>
            A CONTRATADA se obriga a fornecer e instalar os seguintes ambientes planejados:
          </Text>
          
          {contratoData.ambientes.map((ambiente, index) => (
            <View key={index} style={styles.ambienteItem}>
              <View style={styles.ambienteHeader}>
                <Text style={styles.ambienteTitle}>{ambiente.nome}</Text>
                <Text style={styles.ambienteValue}>{formatCurrency(ambiente.valor)}</Text>
              </View>
              <Text>{ambiente.descricao}</Text>
              <Text style={{ fontSize: 9, color: '#666', marginTop: 3 }}>
                Categoria: {ambiente.categoria}
              </Text>
            </View>
          ))}

          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Valor Total dos Serviços:</Text>
              <Text style={styles.totalValue}>{formatCurrency(contratoData.valor_final)}</Text>
            </View>
          </View>
        </View>

        {/* Condições */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONDIÇÕES GERAIS</Text>
          
          <View style={styles.terms}>
            <Text style={styles.termTitle}>1. PRAZO DE ENTREGA</Text>
            <Text>
              O prazo para entrega e instalação é de {contratoData.prazo_entrega}, 
              contados a partir da aprovação do projeto e confirmação do pagamento.
            </Text>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termTitle}>2. GARANTIA</Text>
            <Text>{contratoData.condicoes}</Text>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termTitle}>3. RESPONSABILIDADES</Text>
            <Text>
              A CONTRATADA se responsabiliza pela qualidade dos materiais e pela instalação dos móveis. 
              O CONTRATANTE deve disponibilizar o local e condições adequadas para instalação.
            </Text>
          </View>

          <View style={styles.terms}>
            <Text style={styles.termTitle}>4. VENDEDOR RESPONSÁVEL</Text>
            <Text>Vendedor: {contratoData.vendedor}</Text>
            <Text>Gerente: {contratoData.gerente}</Text>
          </View>
        </View>

        {/* Assinaturas */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>ASSINATURAS</Text>
          
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={{ fontWeight: 'bold' }}>{contratoData.loja.nome}</Text>
                <Text style={{ fontSize: 9, color: '#666' }}>CONTRATADA</Text>
              </View>
            </View>
            
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={{ fontWeight: 'bold' }}>{contratoData.cliente.nome}</Text>
                <Text style={{ fontSize: 9, color: '#666' }}>CONTRATANTE</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>
            São Paulo, {formatDate(contratoData.data_criacao)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};