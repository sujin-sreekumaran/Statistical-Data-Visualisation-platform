import logging
import matplotlib
matplotlib.use('Agg') # Set the backend to 'Agg' to avoid GUI issues

from flask import Blueprint, request, send_file
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io
from scipy.stats import skew, kurtosis
from .visualizations import visualizations

upload_bp = Blueprint('upload', __name__)

# Configure logging
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    
    if file.filename.endswith('.csv'):
        df = pd.read_csv(file)
    elif file.filename.endswith('.xlsx'):
        df = pd.read_excel(file)
    else:
        return 'Invalid file format', 400

    try:
        # Create visualizations in a single column layout
        fig, axes = plt.subplots(5, 1, figsize=(16, 30)) 
       
        for i, (name, func) in enumerate(visualizations.items()):
            func(df, axes[i])
        
        plt.tight_layout()
        
        # Save the plot to a BytesIO object
        img_io = io.BytesIO()
        fig.savefig(img_io, format='png')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        logger.error("Error processing file: %s", e, exc_info=True)
        return str(e), 500
