export const analyzeSalesData = (logs) => {
    if (!logs.length) {
      return {
        specialSalesLeader: { email: 'N/A', specialSales: 0 },
        topOverallSalesmen: [],
      };
    }
  
    const specialSalesActivities = ['Mosquito Sale', 'Tree and Shrub Sale'];
    const salesmanMap = new Map();
  
    logs.forEach(log => {
      const email = log.user_email;
      if (!salesmanMap.has(email)) {
        salesmanMap.set(email, { overallSales: 0, specialSales: 0, email, id: log.user_id });
      }
      const s = salesmanMap.get(email);
      if (Array.isArray(log.activity_type) && log.activity_type.includes('Sold'))
        s.overallSales++;
      if (Array.isArray(log.activity_type)) {
        log.activity_type.forEach(a => {
          if (specialSalesActivities.includes(a)) s.specialSales++;
        });
      }
    });
  
    const allSalesmen = Array.from(salesmanMap.values());
    const specialSalesLeader = allSalesmen.reduce((lead, cur) => {
      if (cur.specialSales > lead.specialSales) return cur;
      if (cur.specialSales === lead.specialSales && cur.overallSales > lead.overallSales) return cur;
      return lead;
    }, { specialSales: -1, email: 'N/A', overallSales: -1 });
  
    const topOverallSalesmen = allSalesmen
      .filter(s => s.overallSales > 0)
      .sort((a, b) => b.overallSales - a.overallSales)
      .slice(0, 10);
  
    return { specialSalesLeader, topOverallSalesmen };
  };
  