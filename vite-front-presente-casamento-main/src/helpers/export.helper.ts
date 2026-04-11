import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Gift } from '../types/index';

export const exportToPdf = async (gifts: Gift[]) => {
    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 15;

        // Citação romântica no topo
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor('#999');
        pdf.text(
            '"O amor se expressa nos pequenos gestos – até mesmo em uma lista de presentes."',
            pageWidth / 2,
            15,
            { align: 'center' }
        );

        // Título principal
        pdf.setFont('times', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor('#333');
        pdf.text('Lista de Presentes Reservados', pageWidth / 2, 30, { align: 'center' });

        // Subtítulo com data
        const today = new Date();
        const formattedDate = today.toLocaleDateString('pt-BR');
        pdf.setFont('times', 'normal');
        pdf.setFontSize(12);
        pdf.setTextColor('#666');
        pdf.text(`Gerado em ${formattedDate}`, pageWidth / 2, 38, { align: 'center' });

        // Filtrar apenas os reservados
        const filteredGifts = gifts.filter((g) => g.status === 'reserved');

        if (filteredGifts.length === 0) {
            pdf.setFontSize(14);
            pdf.setTextColor('#999');
            pdf.text('Nenhum presente reservado encontrado.', pageWidth / 2, 50, { align: 'center' });
        } else {
            // Dados da tabela
            const tableBody = filteredGifts.map((g) => [
                pdf.splitTextToSize(g.name, 60), // Quebra automática
                `R$ ${(g.price ?? 0).toFixed(2).replace('.', ',')}`,
                'Reservado',
                pdf.splitTextToSize(`${g.reservedBy ?? '—'}`, 60),
            ]);

            // Configurações da tabela
            autoTable(pdf, {
                startY: 45,
                head: [['Presente', 'Preço', 'Status', 'Reservado por']],
                body: tableBody,
                theme: 'grid',
                styles: {
                    fontSize: 11,
                    font: 'times',
                    cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
                    textColor: [60, 60, 60],
                    lineColor: [200, 200, 200],
                    lineWidth: 0.2,
                },
                headStyles: {
                    fillColor: [245, 222, 179], // Champagne claro
                    textColor: [80, 80, 80],
                    fontStyle: 'bold',
                    halign: 'center',
                },
                bodyStyles: {
                    valign: 'middle',
                },
                alternateRowStyles: {
                    fillColor: [255, 250, 240], // Bege suave
                },
                columnStyles: {
                    0: { cellWidth: 60 }, // Nome do presente
                    1: { cellWidth: 25 }, // Preço
                    2: { cellWidth: 25 }, // Status
                    3: { cellWidth: 60 }, // Reservado por
                },
                margin: { top: 45, bottom: 30, left: margin, right: margin },
            });
        }

        // Rodapé
        const finalY = filteredGifts.length > 0 ? (pdf as any).lastAutoTable.finalY + 10 : 60;
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10);
        pdf.setTextColor('#888');
        pdf.text(
            'Com carinho, agradecemos a todos que fazem parte da nossa história',
            pageWidth / 2,
            finalY,
            { align: 'center' }
        );

        // Baixar o PDF
        pdf.save(`Lista-de-presentes-${formattedDate.replace(/\//g, '-')}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
    }
};